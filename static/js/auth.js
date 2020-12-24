import { loginRegExp, passwordRegExp } from '/static/js/fieldsRegExps.js'

let login = document.getElementById('login'),
    errorLogin = document.getElementById('error-login'),
    password = document.getElementById('password'),
    errorPassword = document.getElementById('error-password'),
    signInBtn = document.getElementById('signUpBtn');

let setSignUpBtnDisabled = () => {
    signInBtn.disabled = !(loginRegExp.test(login.value) && passwordRegExp.test(password.value));
}

login.onchange = (e) => {
    setSignUpBtnDisabled();
    login.style.outline = loginRegExp.test(login.value) ? "none" : "red solid 2px";
    errorLogin.hidden = loginRegExp.test(login.value)
};
password.onchange = (e) => {
    setSignUpBtnDisabled();
    password.style.outline = passwordRegExp.test(password.value) ? "none" : "red solid 2px";
    errorPassword.hidden = passwordRegExp.test(password.value)
}

signInBtn.onclick = async () => {
    let response = await fetch('', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify({
            username: login.value,
            password: password.value
        })
    });
    let obj = await response.json();
    if (obj.success) {
        window.location.href = '/';
    } else {
        alert(obj.error)
    }
}