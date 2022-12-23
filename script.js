const $wr = document.querySelector('[data-wr]')
const $wr2 = document.querySelector('[data-wr2]')
const $wr3 = document.querySelector('[data-wr3]')

const $modalWr = document.querySelector('[data-modalWr]')
const $modalWr2 = document.querySelector('[data-modalWr2]')
const $modalWr3 = document.querySelector('[data-modalWr3]')

const $modalContent = document.querySelector('[data-modalContent]')
const $modalContent2 = document.querySelector('[data-modalContent2]')
const $modalContent3 = document.querySelector('[data-modalContent3]')

const $catCreateFormTemplate = document.getElementById('createCatForm')
const $catRemoveFormTemplate = document.getElementById('ChangeCatForm')

const CREATE_FORM_LS_KEY = 'CREATE_FORM_LS_KEY'
const CHANGE_FORM_LS_KEY = 'CHANGE_FORM_LS_KEY'

const ACTIONS = {
  DETAIL: 'detail',
  DELETE: 'delete',
  CHANGE: 'change',
}

const getCatHTML = (cat) => `
		<div data-cat-id="${cat.id}" class="card mb-4 mx-2" style="width: 21rem">
		<img src="${cat.image}" class="card-img-top" alt="${cat.name}" />
		<div class="card-body">
			<h5 class="card-title">${cat.name}</h5>
			<p class="card-text">
				${cat.description}
			</p>
			<button data-action="${ACTIONS.DETAIL}" data-openModal="AboutCat" type="button" class="btn btn-primary">Подробнее</button>
      <button data-action="${ACTIONS.CHANGE}" data-openModal="ChangeCat" type="button" class="btn btn-secondary">Изменить</button>
      <button data-action="${ACTIONS.DELETE}" type="button" class="btn btn-danger">Удалить</button>
		</div>
	</div>
	`

fetch('https://cats.petiteweb.dev/api/single/Lukanach/show/')
  .then((res) => res.json())
  .then((data) => {
    $wr.insertAdjacentHTML(
      'afterbegin',
      data.map((cat) => getCatHTML(cat)).join(''),
    )
  })

$wr.addEventListener('click', (e) => {
  if (e.target.dataset.action === ACTIONS.DELETE) {
    const $catWr = e.target.closest('[data-cat-id]')
    const catId = $catWr.dataset.catId

    fetch(`https://cats.petiteweb.dev/api/single/Lukanach/delete/${catId}`, {
      method: 'DELETE',
    }).then((res) => {
      if (res.status === 200) {
        return $catWr.remove()
      }

      alert(`Удаление кота с id = ${catId} не удалось`)
    })
  }
})

const formatCreateFormData = (formDataObject) => ({
  ...formDataObject,
  id: +formDataObject.id,
  rate: +formDataObject.rate,
  age: +formDataObject.age,
  favorite: !!formDataObject.favorite,
})

const clickModalWrHandler = (e) => {
  if (e.target === $modalWr) {
    $modalWr.classList.add('hidden')
    $modalWr.removeEventListener('click', clickModalWrHandler)
    $modalContent.innerHTML = ''
  }
}

const openModalHandler = (e) => {
  const targetModalName = e.target.dataset.openmodal

  if (targetModalName === 'createCat') {
    $modalWr.classList.remove('hidden')
    $modalWr.addEventListener('click', clickModalWrHandler)

    /**
     * Чтобы не хранить HTML разметку нашей формы создания котов в js
     * мы используем тег template. Он был разработкан,
     * как раз для этих целей. В нем может содержаться разметка, которая
     * нужна не сразу, а когда-то в будущем. Наша форма при загрузке не нужна,
     * она потребуется только когда мы нажнем на кнопку "Add", т.е.
     * когда откроется модалка
     * */

    const cloneCatCreateForm = $catCreateFormTemplate.content.cloneNode(true)
    $modalContent.appendChild(cloneCatCreateForm)

    const $createCatForm = document.forms.createCatForm

    const dataFromLS = localStorage.getItem(CREATE_FORM_LS_KEY)

    const preparedDataFromLS = dataFromLS && JSON.parse(dataFromLS)

    if (preparedDataFromLS) {
      Object.keys(preparedDataFromLS).forEach((key) => {
        $createCatForm[key].value = preparedDataFromLS[key]
      })
    }

    /**
     * Так как мы теперь удаляем содержимое модалки (физически удаляем разметку),
     * то нам не нужно праиться над тем, что при следующем открытии модалки на форме
     * будут накапливаться слушатели событий. Нет, после удаления формы из разметки
     * современные браузеры сами удалять всех слушателей. Поэтому выносить callback
     * обработчика событий в отдельную функцию не нужно
     */
    $createCatForm.addEventListener('submit', (submitEvent) => {
      submitEvent.preventDefault()

      const formDataObject = formatCreateFormData(
        Object.fromEntries(new FormData(submitEvent.target).entries()),
      )

      fetch('https://cats.petiteweb.dev/api/single/Lukanach/add/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formDataObject),
      }).then((res) => {
        if (res.status === 200) {
          $modalWr.classList.add('hidden')
          $modalWr.removeEventListener('click', clickModalWrHandler)
          $modalContent.innerHTML = ''

          // После успешного создания кота, удаляем все данные из LS
          // по ключу CREATE_FORM_LS_KEY, чтобы при следующем открытии формы
          // поля были пустые
          localStorage.removeItem(CREATE_FORM_LS_KEY)
          return $wr.insertAdjacentHTML(
            'afterbegin',
            getCatHTML(formDataObject),
          )
        }
        throw Error('Ошибка при создании кота')
      }).catch(alert)
    })
    $createCatForm.addEventListener('change', () => {
      const formattedData = formatCreateFormData(
        Object.fromEntries(new FormData($createCatForm).entries()),
      )

      localStorage.setItem(CREATE_FORM_LS_KEY, JSON.stringify(formattedData))
    })
  }
}

document.addEventListener('click', openModalHandler)

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    $modalWr.classList.add('hidden')
    $modalWr.removeEventListener('click', clickModalWrHandler)
    $modalContent.innerHTML = ''
  }
})

// Модалка открыть инфо о коте

// eslint-disable-next-line no-unused-vars
const formatInfoFormData = (formDataObject) => ({
  ...formDataObject,
  id: +formDataObject.id,
  rate: +formDataObject.rate,
  age: +formDataObject.age,
  favorite: !!formDataObject.favorite,
})

const clickModalWrHandler2 = (e) => {
  if (e.target === $modalWr2) {
    $modalWr2.classList.add('hidden')
    $modalWr2.removeEventListener('click', clickModalWrHandler2)
    $modalContent2.innerHTML = ''
  }
}

const openModalHandler2 = (e) => {
  const targetModalName = e.target.dataset.openmodal

  if (targetModalName === 'AboutCat') {
    $modalWr2.classList.remove('hidden')
    $modalWr2.addEventListener('click', clickModalWrHandler2)

    const getCatHTMLInfo = (cat) => {
      const $catWr = e.target.closest('[data-cat-id]')
      const catId = $catWr.dataset.catId

      if (cat.id == catId) {
        return `
          <div data-cat-id="${cat.id}" class="card card__info">
              <img src="${cat.image}" class="card__img" alt="${cat.name}">
              <div class="card__body">
                  <h5 class="card__title">${cat.name}</h5>
                  <p class="card__text">${cat.description}</p>
                  <p class="card__text">Возраст:&nbsp${cat.age}</p>
                  <p class="card__text">Рейтинг:&nbsp${cat.rate}</p>
                  <p class="card__text">Любимчик:&nbsp${cat.favorite}</p>
              </div>
          </div>
      `
      }
    }

    fetch('https://cats.petiteweb.dev/api/single/Lukanach/show/')
      .then((res) => res.json())
      .then((data) => {
        $wr2.insertAdjacentHTML('afterbegin', data.map((cat) => getCatHTMLInfo(cat)).join(''))
      })
  }
}

document.addEventListener('click', openModalHandler2)

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    $modalWr2.classList.add('hidden')
    $modalWr2.removeEventListener('click', clickModalWrHandler2)
    $modalContent2.innerHTML = ''
  }
})

// Модалка изменить кота

const formatRemoveFormData = (formDataObject) => ({
  ...formDataObject,
  id: +formDataObject.id,
  rate: +formDataObject.rate,
  age: +formDataObject.age,
  favorite: !!formDataObject.favorite,
})

const clickModalWrHandler3 = (e) => {
  if (e.target === $modalWr3) {
    $modalWr3.classList.add('hidden')
    $modalWr3.removeEventListener('click', clickModalWrHandler3)
    $modalContent3.innerHTML = ''
  }
}

const openModalHandler3 = (e) => {
  const targetModalName = e.target.dataset.openmodal

  if (targetModalName === 'ChangeCat') {
    $modalWr3.classList.remove('hidden')
    $modalWr3.addEventListener('click', clickModalWrHandler3)

    const cloneCatRemoveForm = $catRemoveFormTemplate.content.cloneNode(true)
    $modalContent3.appendChild(cloneCatRemoveForm)

    const $ChangeCatForm = document.forms.ChangeCatForm

    const dataFromLS = localStorage.getItem(CHANGE_FORM_LS_KEY)

    const preparedDataFromLS = dataFromLS && JSON.parse(dataFromLS)

    if (preparedDataFromLS) {
      Object.keys(preparedDataFromLS).forEach((key) => {
        $ChangeCatForm[key].value = preparedDataFromLS[key]
      })
    }

    $ChangeCatForm.addEventListener('submit', (submitEvent) => {
      submitEvent.preventDefault()

      const formDataObject = formatRemoveFormData(
        Object.fromEntries(new FormData(submitEvent.target).entries()),
      )

      fetch('https://cats.petiteweb.dev/api/single/Lukanach/update/{id}', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formDataObject),
      }).then((res) => {
        if (res.status === 200) {
          $modalWr3.classList.add('hidden')
          $modalWr3.removeEventListener('click', clickModalWrHandler3)
          $modalContent3.innerHTML = ''

          localStorage.removeItem(CHANGE_FORM_LS_KEY)
          return $wr3.insertAdjacentHTML(
            'afterbegin',
            getCatHTML(formDataObject),
          )
        }
      }).catch(alert)
    })
    $ChangeCatForm.addEventListener('change', () => {
      const formattedData = formatRemoveFormData(
        Object.fromEntries(new FormData($ChangeCatForm).entries()),
      )

      localStorage.setItem(CHANGE_FORM_LS_KEY, JSON.stringify(formattedData))
    })
  }
}
document.addEventListener('click', openModalHandler3)

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    $modalWr3.classList.add('hidden')
    $modalWr3.removeEventListener('click', clickModalWrHandler3)
    $modalContent3.innerHTML = ''
  }
})
