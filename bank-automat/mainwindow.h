#ifndef MAINWINDOW_H
#define MAINWINDOW_H

#include <QMainWindow>
#include <QStackedWidget>
#include <QtNetwork/QNetworkAccessManager>
#include <QtNetwork/QNetworkReply>
#include <QtNetwork/qnetworkrequest.h>
#include <QJsonArray>
#include <QJsonObject>
#include <QJsonDocument>
#include <QKeyEvent>

QT_BEGIN_NAMESPACE
namespace Ui
{
class MainWindow;
}
QT_END_NAMESPACE

class MainWindow : public QMainWindow
{
    Q_OBJECT

public:
    MainWindow(QWidget *parent = nullptr);
    ~MainWindow();

private slots:
    void on_nosta_clicked();
    void on_events_c_clicked();
    void on_events_d_clicked();
    void on_events_back_clicked();
    void on_currency_c_clicked();
    void on_currency_d_clicked();
    void on_curr_back_clicked();
    void on_log_clicked();
    void on_passNum1_clicked();
    void on_passNum2_clicked();
    void on_passNum3_clicked();
    void on_passNum4_clicked();
    void on_passNum5_clicked();
    void on_passNum6_clicked();
    void on_passNum7_clicked();
    void on_passNum8_clicked();
    void on_passNum9_clicked();
    void on_passNum0_clicked();
    void on_passDelete_clicked();
    void on_passEnter_clicked();
    void on_cred_clicked();
    void on_deb_clicked();
    void on_with_c_clicked();
    void on_dep_c_clicked();
    void on_with_d_clicked();
    void on_dep_d_clicked();
    void on_prev_clicked();
    void on_prev_2_clicked();
    void on_dd1_clicked();
    void on_dd2_clicked();
    void on_dd3_clicked();
    void on_dd4_clicked();
    void on_dd5_clicked();
    void on_dd6_clicked();
    void on_dd7_clicked();
    void on_dd8_clicked();
    void on_dd9_clicked();
    void on_dd0_clicked();
    void on_ddEnter_clicked();
    void on_ddDelete_clicked();
    void on_w10_clicked();
    void on_w20_clicked();
    void on_w50_clicked();
    void on_w100_clicked();
    void on_w200_clicked();
    void on_w500_clicked();
    void on_prevBack2_clicked();
    void on_prev_3_clicked();
    void on_log_2_clicked();
    void on_logout_clicked();
    void on_prev_deposit_clicked();
    void on_errorButton_clicked();
    void on_eventsLeft_clicked();
    void on_eventsRight_clicked();
    void on_trans1_clicked();
    void on_trans2_clicked();
    void on_trans3_clicked();
    void on_trans4_clicked();
    void on_trans5_clicked();
    void on_trans6_clicked();
    void on_trans7_clicked();
    void on_trans8_clicked();
    void on_trans9_clicked();
    void on_trans0_clicked();
    void on_transE_clicked();
    void on_transD_clicked();
    void on_siirto_c_clicked();
    void on_siirto_d_clicked();
    void on_transback_clicked();

private:
    Ui::MainWindow *ui;

    void getTransactions();
    void nosto(int);
    void setEditNum(int num);
    int tries = 3;
    int previousPage = 3;
    QNetworkAccessManager *manager;
    void APIPost(QString url, QJsonObject data, std::function<void(QNetworkReply *)> callback);
    void APIGet(QString url, std::function<void(QNetworkReply *)> callback);
    QString authToken;
    QString buffer;
    void keyPressEvent(QKeyEvent *event) override;
    void handleInput(const QString &input);
    void login(const QString &input);
    void logout();
    void gotoErrorPage(QString);
    void resetVariables();

    void showAccount(bool);
    void fetchAccounts();
    void fetchResponse();
    const QString baseUrl = "http://129.151.193.189:3000/api/"; // Serverin IP-osoite ja portti
    void getCurrencyRates();

    void setDepitNum(int num);

    void setCreditNum(int num);

    void transSiirto(int num);

    void transacc(int num);
    void initializeTimeout();
    void resetTimeout();
    void stopTimeout();
};
#endif // MAINWINDOW_H
