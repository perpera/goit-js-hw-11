import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const apiKey = '39896651-9a027bdc3823726f67ea1473a';
const { form, input, gallery, button } = {
  form: document.querySelector('.search-form'),
  input: document.querySelector('[name="searchQuery"]'),
  gallery: document.querySelector('.gallery'),
  button: document.querySelector('.load-more'),
};

button.style.display = 'none';
let page = 1;

form.addEventListener('submit', onSubmit);
button.addEventListener('click', onButtonClick);

async function fetchData(params) {
  try {
    const response = await axios.get('https://pixabay.com/api/', { params });
    return response.data;
  } catch (error) {
    Notiflix.Notify.failure(
      'An error occurred while fetching data. Please try again later.'
    );
  }
}

function updateGallery(data) {
  if (data.hits.length === 0) {
    gallery.innerHTML = '';
    Notiflix.Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
  } else {
    gallery.innerHTML = createMarkup(data.hits);

    if (data.totalHits > page * 40) {
      button.style.display = 'block';
    } else {
      button.style.display = 'none';
    }

    new SimpleLightbox('.gallery a', {
      close: true,
    });
  }
}

async function onSubmit(event) {
  event.preventDefault();
  page = 1;

  const searchQuery = input.value.trim();

  if (!searchQuery) {
    Notiflix.Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
    return;
  }

  const params = {
    key: apiKey,
    q: input.value,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: true,
    per_page: 40,
  };

  try {
    const data = await fetchData(params);
    updateGallery(data);

    if (data.totalHits > 0) {
      Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images.`);
    }

    if (data.totalHits > page * 40) {
      button.style.display = 'block';
    } else {
      button.style.display = 'none';
    }
  } catch (error) {
    Notiflix.Notify.failure(error.message);
  }
}

function createMarkup(arr) {
  return arr
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) =>
        `<div class="photo-card">
        <a class="gallery-link" href="${largeImageURL}">
          <img src="${webformatURL}" alt="${tags}" loading="lazy" width="300" />
        </a>
        <div class="info">
          <p class="info-item">
            <b>Likes<br> ${likes}</b>
          </p>
          <p class="info-item">
            <b>Views<br> ${views}</b>
          </p>
          <p class="info-item">
            <b>Comments<br> ${comments}</b>
          </p>
          <p class="info-item">
            <b>Downloads<br> ${downloads}</b>
          </p>
        </div>
      </div>`
    )
    .join('');
}

async function onButtonClick() {
  page += 1;

  const params = {
    key: apiKey,
    q: input.value,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: true,
    per_page: 40,
    page,
  };

  try {
    const data = await fetchData(params);

    if (data.hits.length === 0) {
      button.style.display = 'none';
    } else {
      const newPhotosMarkup = createMarkup(data.hits);
      gallery.insertAdjacentHTML('beforeend', newPhotosMarkup);

      if (data.totalHits > page * 40) {
        button.style.display = 'block';
      } else {
        button.style.display = 'none';
        Notiflix.Notify.info(
          "We're sorry, but you've reached the end of search results."
        );
      }

      new SimpleLightbox('.gallery a', {
        close: true,
      });
    }
  } catch (error) {
    Notiflix.Notify.failure(error.message);
  }
}
