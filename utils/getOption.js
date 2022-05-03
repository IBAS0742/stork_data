let option = {
    headers: {
        cookie: `u=2977322391; xq_a_token=0991060380dba9ddd373c39bf1c77981f0932a33; xq_id_token=eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJ1aWQiOjI5NzczMjIzOTEsImlzcyI6InVjIiwiZXhwIjoxNjUzNzIxMDI3LCJjdG0iOjE2NTE0MDIyMDE1NzgsImNpZCI6ImVHaXVKQ1luaE0ifQ.Cb2dJsiEsPDYsnK8Vi9Q8DLbA4l-N54ulf4nc3itDWzNH7-0Kth6G59guxEyQ8E-9lzYRyvGh5bHYpium4S38Jx0UDuRGpqm9sW-aR1WQO3bJlSfUApVFYnzhAwzYAKz8UfB8fXgjmgflIp4OJAk3XtloVRtfDqWeEegbIwiRfmQ2g1DMqoi2sj1GCIqTQCZ2EBpmxoJyZdME0_BuDgqrN96qFbpIQ234hOtqD_9IPT0qfyJ37COQ71UxBdM3q4qkyEoqJGKABcInZhGrDX7-qZsqLgbd7UZzBtnfJJSiarg62TCa2Wehk5SgLiRO07Jiavo91FBQJWBN6g9cp1LBw; xq_r_token=3facea0019c51451d8314ac252f1da095c7c1224; xq_is_login=1; X-Snowx-Token=eyJleHAiOiIxNjUxNDA1ODAxODIwIiwiYWxnIjoiQTI1NkdDTUtXIiwiZW5jIjoiQTI1NkdDTSIsIml2IjoiMGtzbkZqV244LVdMMjhzWCIsInRhZyI6IkZOMGdzYWZwYnk4U0s3Z2lGTTZZSncifQ.-HAk_yB5NHl5NCQxCCw6VNokeFrbKxsEYcGfaLv4OEE.Mmxe1cjdj0WZK0qq.aCQAqycI94IGwztbLZ8UfjmRAmKGH48fdnTESrwuj946P-sBt9HKg5awmxl8pU6rnpXsygKLgztm6wZDNPi9.tg_JMJisO5yUyk_Lfh0tKw`,
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