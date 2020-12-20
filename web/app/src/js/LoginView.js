import { waitForEvent } from './util.js'

export class LoginView {
  constructor(api) {
    this.api = api
    this.loginSectionEl = document.querySelector('.login-section')
    this.loginFormEl = document.querySelector('.js-login-form')
    this.submitButtonEl = document.querySelector('.js-submit-button')
    this.generateRoomCodeButtonEl = document.querySelector(
      '.js-generate-room-code'
    )
    this.roomCodeLineEl = document.querySelector('.js-room-code-line')

    this.user = localStorage.getItem('user')
    this.roomCode = localStorage.getItem('roomCode')

    if (this.user) {
      this.loginFormEl.elements.name.value = this.user
    }

    if (this.roomCode) {
      this.loginFormEl.elements.roomCode.value = this.roomCode
    }

    waitForEvent(api.socket, 'open').then(() => {
      if (this.loginFormEl.checkValidity()) {
        this.submitButtonEl.disabled = false
      }
    })
  }

  waitForLogin = async () => {
    return { matches: [] }
  }

  logout = async () => {}
}

export const login = async api => {
  const loginSection = document.querySelector('.login-section')
  const loginForm = document.querySelector('.js-login-form')
  const submitButton = document.querySelector('.js-submit-button')
  const generateRoomCodeButton = document.querySelector(
    '.js-generate-room-code'
  )
  const roomCodeLine = document.querySelector('.js-room-code-line')

  let user = localStorage.getItem('user')
  let roomCode = localStorage.getItem('roomCode')

  if (user) {
    loginForm.elements.name.value = user
  }

  if (roomCode) {
    loginForm.elements.roomCode.value = roomCode
  }

  generateRoomCodeButton.addEventListener('click', () => {
    const charMap = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    const roomCode = Array.from({ length: 4 })
      .map(_ => charMap[Math.floor(Math.random() * charMap.length)])
      .join('')
    loginForm.elements.roomCode.value = roomCode
  })

  return new Promise(resolve => {
    const handleSubmit = async e => {
      e.preventDefault()
      const formData = new FormData(loginForm)
      const name = formData.get('name')
      const roomCode = formData.get('roomCode')
      if (name && roomCode) {
        try {
          const data = await api.login(name, roomCode)
          loginForm.removeEventListener('submit', handleSubmit)

          await loginSection.animate(
            {
              opacity: ['1', '0'],
            },
            {
              duration: 250,
              easing: 'ease-in-out',
              fill: 'both',
            }
          ).finished

          loginSection.hidden = true
          localStorage.setItem('user', name)
          localStorage.setItem('roomCode', roomCode)

          roomCodeLine.dataset.roomCode = roomCode

          document.body.scrollIntoView()

          await Promise.all(
            [
              ...document.querySelectorAll('.rate-section, .matches-section'),
            ].map(node => {
              node.hidden = false
              return node.animate(
                {
                  opacity: ['0', '1'],
                },
                {
                  duration: 250,
                  easing: 'ease-in-out',
                  fill: 'both',
                }
              ).finished
            })
          )

          resolve({ ...data, user: name })
        } catch (err) {
          alert(err.message)
        }
      }
    }

    loginForm.addEventListener('submit', handleSubmit)
  })
}
