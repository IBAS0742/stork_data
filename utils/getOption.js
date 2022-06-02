let option = {
    headers: {
        cookie: `u=2977322391; xq_a_token=d5b43f590163b35fd7bd67459c354e64be8c1b45; xq_id_token=eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJ1aWQiOjI5NzczMjIzOTEsImlzcyI6InVjIiwiZXhwIjoxNjU2Njc3Mjc4LCJjdG0iOjE2NTQwODUyNzg1NjAsImNpZCI6ImVHaXVKQ1luaE0ifQ.EcfxouTtkQ7ONAXpfXWga-ccrWXfvvyo0Xw9ZWnrImP5mqhJB_xHWgFmI8k_XyHg51NBuKpR2BP9IhJx_E7ZHmdjDh_Hf4D23RNyKIRJQpPNnLZHhxToKNXV7zS7zfh7-l6yyQfCcX09yVxrWhxLDuAak490vliYuN8j4kcbSAHZ5G6OJC-XRUQI9jeCG9NrI-uUcdE6Lf2b_ekZWvaTAgTsajjzRh1NjqTc1U04tCLzqF1pRwxF9Nn78_Md67dxwMVBMje0g2ZKRnZKIfDn6PPgQrPQIzYhKRCVvughPHqN-09vg_B6oEtMbgPk4utqJANnuMSi663js3vIAqRuIA; xq_r_token=eb9308b4b373a77bf24734e0120d90b329d38cd3; xq_is_login=1; X-Snowx-Token=eyJleHAiOiIxNjU0MDg4ODc4Njk2IiwiYWxnIjoiQTI1NkdDTUtXIiwiZW5jIjoiQTI1NkdDTSIsIml2IjoiWWpJVVByd3VCVGJob0lUeSIsInRhZyI6InVqTFk4Z29kcl9vYTZHZVlQTk51Z1EifQ.IezWorfSXgcM4J16ac6Fk_KRo3nlkdvlKt_Mb-_C6zo.97xXWc3Tj0DApvNR.nQEek4lolXZLbAwALbOtw8GsFrZ_RKxa-aOkf1YYymjkakRBYaann3IUJOyijP0cSB6UYo4cBuYNuc4a3nDQ.0VzKsMNsf_n9dduy4Jznuw`,
        "user-agent": `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.84 Safari/537.36`
    }
};

module.exports = {
    option,
    setCookie(cookie) {
        let o = JSON.parse(JSON.stringify(option));
        o.headers.cookie = cookie;
        return o;
    }
}