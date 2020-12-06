export const login = async () => {
  const loginSection = document.querySelector('.login-section')
  const loginForm = document.querySelector('.js-login-form')

  let user = localStorage.getItem('user')

  if (user) {
    loginForm.elements.name.value = user
  }

  return new Promise(resolve => {
    const handleSubmit = async e => {
      e.preventDefault()
      const formData = new FormData(loginForm)
      const name = formData.get('name')
      if (name) {
        loginForm.removeEventListener('submit', handleSubmit)
        loginSection.hidden = true
        localStorage.setItem('user', name)
        document
          .querySelectorAll('.rate-section, .matches-section')
          .forEach(el => {
            el.hidden = false
          })
        return resolve(name)
      }
    }

    loginForm.addEventListener('submit', handleSubmit)
  })
}
