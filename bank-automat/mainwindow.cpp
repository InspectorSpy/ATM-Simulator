#include "mainwindow.h"
#include "ui_mainwindow.h"
#include <QDebug>
#include <QMessageBox>
#include <QTimer>

MainWindow::MainWindow(QWidget *parent)
    : QMainWindow(parent), ui(new Ui::MainWindow)
{
    ui->setupUi(this);
    manager = new QNetworkAccessManager(this);

    setFocusPolicy(Qt::StrongFocus);
    setFocus();

    ui->stackedWidget->setCurrentIndex(0);
    ui->logout->setVisible(false);
    ui->wrongPassLabel->hide();
    ui->passEnter->setEnabled(false);
    ui->withdraw_status->hide();
    ui->log->hide();
    ui->log_2->hide();
}

MainWindow::~MainWindow()
{
    delete ui;
}

bool enterCard = true;
bool enterPin = false;
QString card;
int account;
QJsonObject creditAccount;
QJsonObject debitAccount;
int responses = 0;
int pinTimer;
QTimer *timeout;
int eventPage = 1;

void MainWindow::keyPressEvent(QKeyEvent *event)
{
    // qDebug() << "key pressed " << event->key();
    if (event->key() == Qt::Key_Return || event->key() == Qt::Key_Enter)
    {
        handleInput(buffer);
        buffer.clear();
    }
    else
    {
        QString text = event->text();
        if (!text.isEmpty())
            buffer += text;
    }
}

void MainWindow::handleInput(const QString &input)
{
    qDebug() << "User entered:" << input;
    if (enterCard)
    {
        if (input == "wwssadad")
        {
            ui->log->show();
            ui->log_2->show();
            return;
        }
        if (input.length() < 9) return;
        enterCard = false;
        card = input;
        ui->stackedWidget->setCurrentIndex(1);
        enterPin = true;

        pinTimer = 10;
        ui->pinTimer->setText(QString::number(pinTimer));
        QTimer *pinTimeout = new QTimer(this);
        connect(pinTimeout, &QTimer::timeout, this, [this, pinTimeout]()
                {
                    if (!enterPin) {
                        pinTimeout->stop();
                    }
                    pinTimer--;
                    ui->pinTimer->setText(QString::number(pinTimer));
                    if (pinTimer >= 0) return;

                    logout();
                    pinTimeout->stop(); });
        pinTimeout->start(1000);
    }
    else if (enterPin)
    {
        qDebug() << input;
        if (input.isEmpty())
        {
            if (ui->pass->text().length() < 4) return;
            login(ui->pass->text());
        }
        else if (input.length() >= 4)
            login(input);
    }
}

void MainWindow::login(const QString &input)
{
    QJsonObject json;
    json.insert("cardnumber", card);
    json.insert("pin", input);

    APIPost("cards/login", json, [this](QNetworkReply *reply)
            {
                QByteArray response = reply->readAll();
                qDebug() << "login api response: " << response;

                int status = reply->attribute(QNetworkRequest::HttpStatusCodeAttribute).toInt();

                qDebug() << "login status: " << status;
                switch(status)
                {
                case 0:{
                    //serv err?
                    gotoErrorPage("Network Error");
                    break;
                }
                case 401:{
                    //invalid pin
                    ui->wrongPassLabel->show();
                    ui->pass->clear();
                    QTimer *temp = new QTimer(this);
                    connect(temp, &QTimer::timeout, this, [this]()
                            {
                                ui->wrongPassLabel->hide();
                            });
                    temp->setSingleShot(true);
                    temp->start(2000);
                    break;
                }
                case 403:{
                    //card locked
                    ui->stackedWidget->setCurrentIndex(2);
                    ui->passEnter->setEnabled(false);
                    break;
                }
                case 200: //correct pin
                    QJsonDocument doc = QJsonDocument::fromJson(response);
                    if (!doc.isObject()) {
                        qDebug() << "Invalid JSON response";
                        return;
                    }

                    QJsonObject obj = doc.object();
                    QString token = obj.value("token").toString();

                    qDebug() << "Parsed token:" << token;

                    this->authToken = token;

                    initializeTimeout();

                    enterPin = false;
                    fetchAccounts();
                    ui->cred->hide();
                    ui->deb->hide();
                    ui->label_3->setText("fetching accounts");
                    ui->logout->setVisible(true);
                    ui->stackedWidget->setCurrentIndex(3);


                    break;
                } });
}
void MainWindow::resetVariables()
{
    ui->logout->setVisible(false);
    authToken.clear();
    enterCard = true;
    enterPin = false;
    ui->pass->clear();
    ui->passEnter->setEnabled(true);
    responses = 0;
    creditAccount = QJsonObject();
    debitAccount = QJsonObject();
    stopTimeout();
    ui->passEnter->setEnabled(false);
    eventPage = 1;
}
void MainWindow::logout()
{
    resetVariables();
    ui->stackedWidget->setCurrentIndex(0);
}
void MainWindow::gotoErrorPage(QString errMsg)
{
    resetVariables();
    ui->stackedWidget->setCurrentWidget(ui->errorPage);
    ui->errorLabel->setText(errMsg);
}
void MainWindow::on_logout_clicked() { logout(); }

void MainWindow::on_log_clicked()
{
    handleInput("06000641f3");
}

void MainWindow::on_passDelete_clicked()
{
    QString pass = ui->pass->text();
    ui->passEnter->setEnabled(false);
    if (!pass.isEmpty())
    {
        pass.chop(1);
        ui->pass->setText(pass);
    }
}

void MainWindow::on_passEnter_clicked()
{
    QString pass = ui->pass->text();

    login(pass);
}

void MainWindow::setEditNum(int num)
{
    QString pass = ui->pass->text();
    if (pass.length() >= 4)
        return;
    ui->pass->setText(pass + QString::number(num));
    if (ui->pass->text().length() == 4)
        ui->passEnter->setEnabled(true);
}

void MainWindow::on_cred_clicked()
{
    showAccount(true);
}

void MainWindow::on_deb_clicked()
{
    showAccount(false);
}
void MainWindow::fetchAccounts()
{
    QString url = "accountcard";

    QJsonObject json;
    json.insert("cardnumber", card);
    json.insert("accounttype", "credit");
    APIPost(url, json, [this](QNetworkReply *reply)
            {
                QByteArray response = reply->readAll();
                qDebug() << response;

                int status = reply->attribute(QNetworkRequest::HttpStatusCodeAttribute).toInt();

                QJsonDocument doc = QJsonDocument::fromJson(response);

                if (status == 200) creditAccount = doc.object();
                fetchResponse(); });
    json = QJsonObject();
    json.insert("cardnumber", card);
    json.insert("accounttype", "debit");
    APIPost(url, json, [this](QNetworkReply *reply)
            {
                QByteArray response = reply->readAll();
                qDebug() << response;

                int status = reply->attribute(QNetworkRequest::HttpStatusCodeAttribute).toInt();

                QJsonDocument doc = QJsonDocument::fromJson(response);

                if (status == 200) debitAccount = doc.object();
                fetchResponse(); });
}
void MainWindow::fetchResponse()
{
    responses++;
    if (responses == 2)
    {
        bool c = false;
        bool d = false;

        if (!debitAccount.isEmpty())
        {
            ui->deb->show();
            d = true;
        }
        if (!creditAccount.isEmpty())
        {
            ui->cred->show();
            c = true;
        }
        if (d && !c)
        {
            showAccount(false);
            ui->prev->hide();
            ui->prev_2->hide();
        }
        else if (c && !d)
        {
            showAccount(true);
            ui->prev->hide();
            ui->prev_2->hide();
        }
        else if (!c && !d)
            ui->label_3->setText("tiliä ei löydetty");
        else
        {
            ui->prev->show();
            ui->prev_2->show();
            ui->label_3->setText("valitse tili");
        }
    }
}
int prevBack;
void MainWindow::showAccount(bool credit) // valittiinko credit vai debit?
{
    QJsonObject obj = credit ? creditAccount : debitAccount;
    if (credit)
    {
        ui->stackedWidget->setCurrentIndex(7);
        prevBack = 7;
        ui->credit_welcome->setText("tervetuloa " + obj.value("fname").toString());
        ui->credit_balance->setText(obj.value("balance").toString() + "€");
    }
    else
    {
        prevBack = 4;
        ui->stackedWidget->setCurrentIndex(4);
        ui->debit_welcome->setText("tervetuloa " + obj.value("fname").toString());
        ui->debit_balance->setText(obj.value("balance").toString() + "€");
    }
    account = obj.value("idaccount").toInt();
}

void MainWindow::initializeTimeout()
{
    timeout = new QTimer(this);
    connect(timeout, &QTimer::timeout, this, [this]()
            { gotoErrorPage("Session Timed Out"); });
    timeout->setSingleShot(true);
    timeout->start(30000);
}
void MainWindow::resetTimeout()
{
    if (timeout == nullptr) return;
    timeout->start(30000);
}
void MainWindow::stopTimeout()
{
    if (timeout == nullptr) return;
    timeout->stop();
}

void MainWindow::on_prev_clicked()
{
    ui->stackedWidget->setCurrentIndex(3);
}

void MainWindow::on_prev_2_clicked()
{
    ui->stackedWidget->setCurrentIndex(3);
}

void MainWindow::on_prev_3_clicked()
{
    ui->passEnter->setEnabled(true); // Varmistetaan että "enter" on käytössä
    ui->stackedWidget->setCurrentIndex(1);
}

void MainWindow::APIPost(QString url, QJsonObject data, std::function<void(QNetworkReply *)> callback)
{
    QNetworkRequest request(baseUrl + url);
    request.setHeader(QNetworkRequest::ContentTypeHeader, "application/json");

    if (!authToken.isEmpty())
    {
        request.setRawHeader("Authorization", "Bearer " + authToken.toUtf8());
    }

    QJsonDocument jsonDoc(data);
    QNetworkReply *reply = manager->post(request, jsonDoc.toJson());

    connect(reply, &QNetworkReply::finished, this, [reply, callback, this]()
            {
                int status = reply->attribute(QNetworkRequest::HttpStatusCodeAttribute).toInt();
                if (status == 500) gotoErrorPage("Server Error");
                else callback(reply);
                reply->deleteLater(); });
}
void MainWindow::APIGet(QString url, std::function<void(QNetworkReply *)> callback)
{
    QNetworkRequest request(baseUrl + url);
    request.setHeader(QNetworkRequest::ContentTypeHeader, "application/json");

    if (!authToken.isEmpty())
    {
        request.setRawHeader("Authorization", "Bearer " + authToken.toUtf8());
    }

    QNetworkReply *reply = manager->get(request);

    connect(reply, &QNetworkReply::finished, this, [reply, callback, this]()
            {
                int status = reply->attribute(QNetworkRequest::HttpStatusCodeAttribute).toInt();
                if (status == 500) gotoErrorPage("Server Error");
                else callback(reply);
                reply->deleteLater(); });
}

void MainWindow::on_passNum1_clicked()
{
    setEditNum(1);
}

void MainWindow::on_passNum2_clicked()
{
    setEditNum(2);
}

void MainWindow::on_passNum3_clicked()
{
    setEditNum(3);
}

void MainWindow::on_passNum4_clicked()
{
    setEditNum(4);
}

void MainWindow::on_passNum5_clicked()
{
    setEditNum(5);
}

void MainWindow::on_passNum6_clicked()
{
    setEditNum(6);
}

void MainWindow::on_passNum7_clicked()
{
    setEditNum(7);
}

void MainWindow::on_passNum8_clicked()
{
    setEditNum(8);
}

void MainWindow::on_passNum9_clicked()
{
    setEditNum(9);
}

void MainWindow::on_passNum0_clicked()
{
    setEditNum(0);
}

void MainWindow::on_with_c_clicked()
{
    ui->stackedWidget->setCurrentIndex(9);
    resetTimeout();
}

void MainWindow::on_dep_c_clicked()
{
    ui->stackedWidget->setCurrentIndex(5);
    resetTimeout();
}

void MainWindow::on_with_d_clicked()
{
    ui->stackedWidget->setCurrentIndex(9);
    resetTimeout();
}

void MainWindow::on_dep_d_clicked()
{
    ui->stackedWidget->setCurrentIndex(5);
    resetTimeout();
}

void MainWindow::on_log_2_clicked()
{
    handleInput("060005fbdc");
}

// Valuutat
void MainWindow::on_currency_c_clicked()
{
    getCurrencyRates();
    resetTimeout();
}

void MainWindow::on_currency_d_clicked()
{
    getCurrencyRates();
    resetTimeout();
}

void MainWindow::getCurrencyRates()
{
    previousPage = ui->stackedWidget->currentIndex(); // Tallenna nykyinen sivu, jotta siihen voi palata myöhemmin

    APIGet("currency/change", [this](QNetworkReply *reply)
    {
       int status = reply->attribute(QNetworkRequest::HttpStatusCodeAttribute).toInt();
       if (status != 200) return;

       QByteArray response = reply->readAll();
       QJsonDocument doc = QJsonDocument::fromJson(response);
       if (!doc.isObject()) return;

       QJsonObject obj = doc.object();
       QJsonObject rates = obj.value("rates").toObject();

       auto formatRate = [](QJsonObject rate) {
           QString dir = rate.value("direction").toString() == "up" ? "↑" : "↓";
           return QString("1 EUR = %1 %2 %3%")
               .arg(rate.value("today").toDouble(), 0, 'f', 4)
               .arg(dir)
               .arg(QString::number(rate.value("change_pct").toDouble(), 'f', 2));
       };

       ui->curr_usd->setText("USD: " + formatRate(rates.value("USD").toObject()));
       ui->curr_gbp->setText("GBP: " + formatRate(rates.value("GBP").toObject()));
       ui->curr_sek->setText("SEK: " + formatRate(rates.value("SEK").toObject()));
       ui->curr_nok->setText("NOK: " + formatRate(rates.value("NOK").toObject()));

       ui->stackedWidget->setCurrentIndex(6); });
}

void MainWindow::on_events_c_clicked()
{
    getTransactions();
    resetTimeout();
}
void MainWindow::on_events_d_clicked()
{
    getTransactions();
    resetTimeout();
}

void MainWindow::getTransactions()
{
    QString url = "transactions/" + QString::number(account) + "?page=" + QString::number(eventPage);

    APIGet(url, [this](QNetworkReply *reply)
    {
       int status = reply->attribute(QNetworkRequest::HttpStatusCodeAttribute).toInt();
       if (status == 404) eventPage--;
       if (status != 200) return;

       QByteArray response = reply->readAll();
       QJsonDocument doc = QJsonDocument::fromJson(response);
       if (!doc.isObject()) return;

       QJsonObject obj = doc.object();
       QJsonArray transactions = obj.value("transactions").toArray();

       QString display = "";
       for (const QJsonValue &val : transactions) {
           QJsonObject t = val.toObject();
           display += t.value("transaction_type").toString() + "  " +
                      t.value("amount").toString() + "€  " +
                      t.value("transaction_datetime").toString();
           display.chop(5);
           display += "\n";
       }

       ui->events_label->setText(display);
       ui->stackedWidget->setCurrentIndex(8);
       ui->eventsPageLabel->setText("Page: " + QString::number(eventPage)); });
}

void MainWindow::on_events_back_clicked()
{
    ui->stackedWidget->setCurrentIndex(prevBack);
    resetTimeout();
}

void MainWindow::on_curr_back_clicked()
{
    ui->stackedWidget->setCurrentIndex(previousPage);
    resetTimeout();
}

void MainWindow::on_dd1_clicked()
{
    setDepitNum(1);
}

void MainWindow::on_dd2_clicked()
{
    setDepitNum(2);
}

void MainWindow::on_dd3_clicked()
{
    setDepitNum(3);
}

void MainWindow::on_dd4_clicked()
{
    setDepitNum(4);
}

void MainWindow::on_dd5_clicked()
{
    setDepitNum(5);
}

void MainWindow::on_dd6_clicked()
{
    setDepitNum(6);
}

void MainWindow::on_dd7_clicked()
{
    setDepitNum(7);
}

void MainWindow::on_dd8_clicked()
{
    setDepitNum(8);
}

void MainWindow::on_dd9_clicked()
{
    setDepitNum(9);
}

void MainWindow::on_dd0_clicked()
{
    setDepitNum(0);
}

void MainWindow::on_ddEnter_clicked()
{
    QJsonObject json;
    QString url = "transactions/deposit";
    json.insert("idaccount", account);
    int x = ui->ddDeposit->text().toInt();
    json.insert("amount", x);
    qDebug() << json;

    APIPost(url, json, [this](QNetworkReply *reply)
            {
                QByteArray response = reply->readAll();
                qDebug() << response;

                int status = reply->attribute(QNetworkRequest::HttpStatusCodeAttribute).toInt();
                qDebug() << status;

                if (status == 200) {
                    ui->ddDeposit->clear();
                    ui->stackedWidget->setCurrentIndex(prevBack);
                }
            });
}

void MainWindow::on_ddDelete_clicked()

{
    QString text = ui->ddDeposit->text();
    if (!text.isEmpty())
    {
        text.chop(1);
        ui->ddDeposit->setText(text);
    }


}

void MainWindow::setDepitNum(int num)
{
    resetTimeout();
    QString ddDeposit = ui->ddDeposit->text();
    ui->ddDeposit->setText(ddDeposit + QString::number(num));
}

void MainWindow::nosto(int x)
{
    QJsonObject json;
    QString url = "transactions/withdraw";
    json.insert("idaccount", account);
    json.insert("amount", x);
    qDebug() << json;

    // kaikki koodi logiikka pitää laittaa replyn sisälle, sillä voi mennä hetki että backend vastaa
    APIPost(url, json, [this](QNetworkReply *reply)
    {
        QByteArray response = reply->readAll();
        qDebug() << response;
        int status = reply->attribute(QNetworkRequest::HttpStatusCodeAttribute).toInt();
        qDebug() << status;

        if (status == 200) {
            //ui->withdraw_status->setText("Withdraw Succesful");
            //ui->withdraw_status->show();
            ui->stackedWidget->setCurrentIndex(prevBack);
        }
        else {
            QJsonDocument doc = QJsonDocument::fromJson(response);
            QString errorMsg = "Virhe";
            if (doc.isObject()) {
                errorMsg = doc.object().value("error").toString();
            }
            ui->withdraw_status->setText(errorMsg);
            ui->withdraw_status->repaint(); // force visual update
        } });
}

// Amount buttons for display
void MainWindow::on_w10_clicked() { ui->withdraw_amount->setText("10"); }
void MainWindow::on_w20_clicked() { ui->withdraw_amount->setText("20"); }
void MainWindow::on_w50_clicked() { ui->withdraw_amount->setText("50"); }
void MainWindow::on_w100_clicked() { ui->withdraw_amount->setText("100"); }
void MainWindow::on_w200_clicked() { ui->withdraw_amount->setText("200"); }
void MainWindow::on_w500_clicked() { ui->withdraw_amount->setText("500"); }

// Withdraw button sends the API request
void MainWindow::on_nosta_clicked()
{
    QString amountText = ui->withdraw_amount->text();
    int amount = amountText.toInt();
    if (amount <= 0)
    {
        return;
    }
    nosto(amount);
}

void MainWindow::on_prevBack2_clicked()
{
    ui->stackedWidget->setCurrentIndex(prevBack);
    ui->withdraw_status->hide();
    resetTimeout();
}

void MainWindow::on_prev_deposit_clicked()
{
    ui->stackedWidget->setCurrentIndex(prevBack);
    resetTimeout();
}

void MainWindow::on_errorButton_clicked()
{
    ui->stackedWidget->setCurrentIndex(0);
}

void MainWindow::on_eventsLeft_clicked()
{
    resetTimeout();
    if (eventPage == 1)
        return;
    eventPage--;
    getTransactions();
}

void MainWindow::on_eventsRight_clicked()
{
    resetTimeout();
    eventPage++;
    getTransactions();
}

void MainWindow::on_trans1_clicked()
{
    transSiirto(1);
}

void MainWindow::on_trans2_clicked()
{
    transSiirto(2);
}

void MainWindow::on_trans3_clicked()
{
    transSiirto(3);
}

void MainWindow::on_trans4_clicked()
{
    transSiirto(4);
}

void MainWindow::on_trans5_clicked()
{
    transSiirto(5);
}

void MainWindow::on_trans6_clicked()
{
    transSiirto(6);
}

void MainWindow::on_trans7_clicked()
{
    transSiirto(7);
}

void MainWindow::on_trans8_clicked()
{
    transSiirto(8);
}

void MainWindow::on_trans9_clicked()
{
    transSiirto(9);
}

void MainWindow::on_trans0_clicked()
{
    transSiirto(0);
}

int selectamount = 0;

void MainWindow::on_transE_clicked()
{
    if (selectamount == 0)
    {
        selectamount = 1;
    }
    else if (selectamount == 1)
    {
        QJsonObject json;
        QString url = "transactions/transfer";
        json.insert("idaccount", account);
        int x = ui->siirto->text().toInt();
        json.insert("amount", x);
        json.insert("targetaccountnumber", "FI" + ui->transAcc->text());
        qDebug() << json;

        APIPost(url, json, [this](QNetworkReply *reply)
                {
                    QByteArray response = reply->readAll();
                    qDebug() << response;
                    int status = reply->attribute(QNetworkRequest::HttpStatusCodeAttribute).toInt();
                    qDebug() << status;

                    if (status == 200) {
                        selectamount = 0;
                        ui->siirto->clear();
                        ui->transAcc->clear();
                        ui->stackedWidget->setCurrentIndex(prevBack);
                    }
                });
    }
}

// ei toimi vielä
void MainWindow::on_transD_clicked()
{
    if (selectamount == 0)
    {
        QString text = ui->siirto->text();

        if (!text.isEmpty())
        {
            text.chop(1);
            ui->siirto->setText(text);
        }
    }
    else if (selectamount == 1)
    {
        QString text = ui->transAcc->text();

        text.chop(1);
        ui->transAcc->setText(text);
    }
}

void MainWindow::transSiirto(int num)
{
    if (selectamount == 0)
    {
        QString siirto = ui->siirto->text();
        ui->siirto->setText(siirto + QString::number(num));
    }

    else if (selectamount == 1)
    {
        QString transAcc = ui->transAcc->text();
        ui->transAcc->setText(transAcc + QString::number(num));
    }
}

void MainWindow::on_siirto_c_clicked()
{
    ui->stackedWidget->setCurrentWidget(ui->transactionPage);
}

void MainWindow::on_siirto_d_clicked()
{
    ui->stackedWidget->setCurrentWidget(ui->transactionPage);
}

void MainWindow::on_transback_clicked()
{
    selectamount = 0;
    ui->siirto->clear();
    ui->transAcc->clear();
    ui->stackedWidget->setCurrentIndex(prevBack);
}
