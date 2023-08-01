(function () {
    const login = <HTMLButtonElement>document.getElementById('login');
    const input = <HTMLInputElement>document.getElementById('username');

    if (!login) {
        console.log('No button :(');
        return;
    }

    login.addEventListener('click', async () => {
        if (!input || !input.value) {
            alert('Please enter your username');
            return;
        }

        try {
            const res = await fetch('/api/v1/users/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: input.value,
                    password: 'test',
                }),
            });

            const response = await res.json();

            if (response.tooMany) {
                alert('Too many attempts. Please try again later');
            } else {
                alert('Invalid credentials');
            }
        } catch (e) {
            console.log('Error', e);
        }
    });
})();