const bcrypt = require('bcryptjs');

const pins = [
    { pin: '1234', label: 'Card 1' },
    { pin: '4321', label: 'Card 2' },
];

(async () => {
    for (const { pin, label } of pins) {
        const hash = await bcrypt.hash(pin, 10);
        console.log(`${label} PIN ${pin} => ${hash}`);
    }
})();