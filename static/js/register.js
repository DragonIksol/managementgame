import { loginRegExp, passwordRegExp } from '/static/js/fieldsRegExps.js'



let imagesMap = [],
    avatarsContainer = document.getElementById('avatars'),
    avatarStart = 0,
    avatarEnd = 4;
let currentFocusAvatar;

let createAvatarsList = () => {
    while (avatarsContainer.firstChild) avatarsContainer.removeChild(avatarsContainer.lastChild);
    let i = avatarStart - 1;
    while (i != avatarEnd) {
        i++;
        if (i >= 10) i = i % imagesMap.length;
        avatarsContainer.appendChild(imagesMap[i]);
    }
}

// Загрузка картинок
(async () => {
    try {
        let response = await fetch('/avatars/');
        let obj = await response.json();
        if (obj.error) throw new Error(obj.error);
        obj.data.forEach((url, index) => {
            let img = new Image(200, 200);
            img.src = url;
            img.className = "avatar";
            img.alt = index + 1;

            img.onclick = () => {
                currentFocusAvatar && (currentFocusAvatar.style.outline = "none");
                img.style.outline = "2px solid black";
                currentFocusAvatar = img;
                setRegisterBtnDisabled();
            }

            imagesMap.push(img);
        });
        createAvatarsList(avatarStart, avatarEnd);
    } catch (e) {
        console.log(e.stack);
        alert('Не удалось загрузить изображния')
    }
})();
let avatars = document.querySelectorAll(".avatar");
avatars.forEach((avatar) => {
    avatar.onclick = () => {
        currentFocusAvatar && (currentFocusAvatar.style.outline = "none");
        avatar.style.outline = "2px solid aquamarine";
        currentFocusAvatar = avatar;
    }
})

let login = document.getElementById('login'),
    errorLogin = document.getElementById('error-login'),
    password = document.getElementById('password'),
    errorPassword = document.getElementById('error-password'),
    email = document.getElementById('email'),
    errorEmail = document.getElementById('error-email'),
    passwordRepeat = document.getElementById('passwordRepeat'),
    errorPasswordRepeat = document.getElementById('error-password-repeat'),
    notEqualPasswordText = document.getElementById('not-equal-passwords'),
    registerBtn= document.getElementById('registerBtn');

let setRegisterBtnDisabled = () => {
    registerBtn.disabled = !(
        loginRegExp.test(login.value) &&
        passwordRegExp.test(password.value) &&
        passwordRegExp.test(passwordRepeat.value) &&
        email.checkValidity() &&
        password.value === passwordRepeat.value &&
        currentFocusAvatar
    );
}

login.onchange = (e) => {
    setRegisterBtnDisabled();
    login.style.outline = loginRegExp.test(login.value) ? "none" : "red solid 2px";
    notEqualPasswordText.hidden = password.value === passwordRepeat.value;
    errorLogin.hidden = loginRegExp.test(login.value)
};
password.onchange = (e) => {
    password.style.outline = passwordRegExp.test(password.value) ? "none" : "red solid 2px";
    errorPassword.hidden = passwordRegExp.test(password.value)
    notEqualPasswordText.hidden = password.value === passwordRepeat.value;
    setRegisterBtnDisabled();
};
passwordRepeat.onchange = (e) => {
    passwordRepeat.style.outline = passwordRegExp.test(passwordRepeat.value) ? "none" : "red solid 2px";
    errorPasswordRepeat.hidden = passwordRegExp.test(passwordRepeat.value)
    notEqualPasswordText.hidden = password.value === passwordRepeat.value;
    setRegisterBtnDisabled();
};
email.onchange = (e) => {
    email.style.outline = email.checkValidity() ? "none" : "red solid 2px";
    errorEmail.hidden = email.checkValidity()
    notEqualPasswordText.hidden = password.value === passwordRepeat.value;
    setRegisterBtnDisabled();
};

let nextArrow = document.getElementById('next-arrow'),
    prevArrow = document.getElementById('prev-arrow');

nextArrow.onclick = () => {
    avatarStart++;
    avatarStart = avatarStart < imagesMap.length ? avatarStart : avatarStart % imagesMap.length;
    avatarEnd++;
    avatarEnd = avatarEnd < imagesMap.length ? avatarEnd : avatarEnd % imagesMap.length;
    createAvatarsList();
}
prevArrow.onclick = () => {
    avatarStart--;
    avatarStart = avatarStart >= 0 ? avatarStart : avatarStart + imagesMap.length;
    avatarEnd--;
    avatarEnd = avatarEnd >= 0 ? avatarEnd : avatarEnd + imagesMap.length;
    createAvatarsList();
}

registerBtn.onclick = async () => {
    let response = await fetch('', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify({
            username: login.value,
            password: password.value,
            email: email.value,
            avatar_url: currentFocusAvatar.getAttribute("src")
        })
    });
    let obj = await response.json();
    if (obj.success) {
        window.location.href = '/';
    }
}