const app = new Vue({
  el: '#app',
  data: {
    search_data: '',
    menu_items: [],
    search_flag: true,
    genre_flag: false,
    cards: [],
    totalFilm: '',
    id: '',
    temp: [],
    title: '',
    year: '',
    overview: '',
    image: '',
    genres: [
      { id: 28, name: 'Azione' },
      { id: 12, name: 'Avventura' },
      { id: 16, name: 'Animazione' },
      { id: 35, name: 'Commedia' },
      { id: 80, name: 'Crime' },
      { id: 99, name: 'Documentario' },
      { id: 18, name: 'Dramma' },
      { id: 10751, name: 'Famiglia' },
      { id: 14, name: 'Fantasy' },
      { id: 36, name: 'Storia' },
      { id: 27, name: 'Horror' },
      { id: 10402, name: 'Musica' },
      { id: 9648, name: 'Mistero' },
      { id: 10749, name: 'Romance' },
      { id: 878, name: 'Fantascienza' },
      { id: 10770, name: 'televisione film' },
      { id: 53, name: 'Thriller' },
      { id: 10752, name: 'Guerra' },
      { id: 37, name: 'Western' },
    ],
    film_details: [],
    key: 0,
    password: 'pass',
    tmdb: {},
    index: 0,
    popup: 0,
    next_page: true,
    login_flag: true,
    api_key_tmdb: '65d98f1b94ec4cf5a93baed84de2047b',
    token_drive: '',
  },
  created: function () {
    window.onbeforeunload = function () {
      return '';
    };
    const myLazyLoad = new LazyLoad({
      elements_selector: '.lazy',
    });
    $.getJSON('./cards.json', function (data) {
      localStorage.setItem('cards', JSON.stringify(data));
    });
  },
  mounted: function () {
    gapi.load('client:auth2', function () {
      gapi.auth2.init({
        client_id:
          '114084790467-km976fe3h5sd8t9bb8uc52cm3ohi6je8.apps.googleusercontent.com',
      });
    });
    let cook = localStorage.getItem('cookie');
    setTimeout(() => {
      $.getJSON('./cards.json', function (data) {
        app.cards = data;
        app.totalFilm = data.length;
      });
      localStorage.setItem('cookie', 'true');
      setTimeout(() => {
        app.kodi();
        app.play();
      }, 1000);
    }, 1000);
  },
  methods: {
    authenticate() {
      return gapi.auth2
        .getAuthInstance()
        .signIn({
          scope:
            'https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/drive.appdata https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.metadata https://www.googleapis.com/auth/drive.metadata.readonly https://www.googleapis.com/auth/drive.photos.readonly https://www.googleapis.com/auth/drive.readonly',
        })
        .then(
          function () {
            console.log('Sign-in successful');
          },
          function (err) {
            console.error('Error signing in', err);
          }
        );
    },
    loadClient() {
      gapi.client.setApiKey('AIzaSyCWUgPXRQ_865H4HC5fvRNWQWRkriQHeck');
      return gapi.client
        .load('https://content.googleapis.com/discovery/v1/apis/drive/v3/rest')
        .then(
          function () {
            console.log('GAPI client loaded for API');
          },
          function (err) {
            console.error('Error loading GAPI client for API', err);
          }
        );
    },
    execute() {
      if (app.search_data == '') {
        app.search_data =
          "mimeType != 'application/vnd.google-apps.folder' and parents in '1va8p3VqGDys624xvsXyramu5SJn0fYVZ'";
      } else {
        let x = app.search_data;
        app.search_data =
          "name contains '" +
          x +
          "' and parents in '1va8p3VqGDys624xvsXyramu5SJn0fYVZ'";
        x = null;
      }
      return gapi.client.drive.files
        .list({
          corpora: 'drive',
          driveId: '0AGuQLMP7sJhdUk9PVA',
          includeItemsFromAllDrives: true,
          includeTeamDriveItems: true,
          pageSize: 1000,
          supportsAllDrives: true,
          supportsTeamDrives: true,
          teamDriveId: '0AGuQLMP7sJhdUk9PVA',
          orderBy: 'modifiedTime',
          q: app.search_data,
          pageToken: app.token_drive,
        })
        .then(
          function (response) {
            // console.log("Response", response);
            app.temp = response.result.files.concat(app.temp);
            app.token_drive = response.result.nextPageToken;
            app.search_data = '';
            if (app.token_drive === undefined) {
              app.next_page = false;
            }
          },
          function (err) {
            console.error('Execute error', err);
          }
        );
    },
    drive(id) {
      return gapi.client.drive.files.get({
        fileId: id,
        alt: 'media',
      });

      // GET https://www.googleapis.com/drive/v3/files/1z1bG9WoPiNIURS2uiCHuJxM8yUCdiZMB?supportsAllDrives=true&supportsTeamDrives=true&key=[YOUR_API_KEY] HTTP/1.1
    },
    kodi() {
      //document.getElementById('kodi').style.display = "none";
      //if (prompt("Inserire password -  Per ricevere la password contattare kodidrive.tv@gmail.com").toLowerCase() == this.password) {
      const x = localStorage.getItem('cards');
      if (x == null || x == undefined || x.length == 0 || x == '[]') {
        localStorage.clear();
      } else {
        $.getJSON('./cards.json', function (data) {
          app.cards = data;
          app.totalFilm = data.length;
          localStorage.setItem('cookie', 'true');
        });
      }
      setTimeout(() => {
        app.play();
      }, 1000);
      //}
    },
    async listaGenre() {
      await axios
        .get('https://api.themoviedb.org/3/genre/movie/list', {
          params: {
            api_key: this.api_key_tmdb,
            language: 'it-IT',
          },
        })
        .then(function (resp) {
          // console.log(resp.data.results);
          app.tmdb[0] = resp.data.results;
        })
        .catch(function (err) {
          console.error(err);
        });
    },
    async startCall(film_name, index) {
      await axios
        .get('https://api.themoviedb.org/3/search/movie', {
          params: {
            api_key: this.api_key_tmdb,
            language: 'it-IT',
            query: film_name,
          },
        })
        .then(function (resp) {
          // console.log(resp.data.results);
          app.tmdb[index] = resp.data.results[0];
        })
        .catch(function (err) {
          console.error(err);
        });
    },
    async updateCall(film_name, year, index) {
      await axios
        .get('https://api.themoviedb.org/3/search/movie', {
          params: {
            api_key: this.api_key_tmdb,
            language: 'it-IT',
            query: film_name,
            year: year,
          },
        })
        .then(function (resp) {
          // console.log(resp.data.results);
          app.tmdb = resp.data.results;
        })
        .catch(function (err) {
          console.error(err);
        });
    },
    login() {
      app.cards = [];
      const x = document.getElementById('loader');
      const y = document.getElementById('wait');
      x.classList.add('active');
      y.classList.add('active');
      y.innerHTML = '<h3>Caricamento...</h3>';
      if (app.login_flag == true) {
        this.authenticate()
          .then(this.loadClient)
          .then(this.execute)
          .then(() => {
            setTimeout(() => {
              if (app.next_page == true) {
                this.login();
              } else {
                this.parseTemp();
              }
            }, 3000);
          });
      } else {
        this.execute().then(() => {
          setTimeout(() => {
            if (app.next_page == true) {
              this.login();
            } else {
              this.parseTemp();
            }
          }, 1000);
        });
      }
    },
    async parseTemp() {
      for (let index = 0; index < app.temp.length; index++) {
        app.temp[index].name = app.temp[index].name.toLowerCase();
        app.temp[index].name = app.temp[index].name.replace('.mkv', '');
        app.temp[index].name = app.temp[index].name.replace('.mp4', '');
        app.temp[index].name = app.temp[index].name.replace('.mpg', '');
        app.temp[index].name = app.temp[index].name.replace('.avi', '');
        app.temp[index].name = app.temp[index].name.replace('cd1', '');
        app.temp[index].name = app.temp[index].name.replace('cd2', '');
        app.temp[index].name = app.temp[index].name.replace('  ', ' ');
        app.temp[index].name = app.temp[index].name.split('.').join(' ');
        app.temp[index].name = app.temp[index].name.split('-').join(' ');
        if (app.temp[index].name.charAt(0) == ' ') {
          app.temp[index].name = app.temp[index].name.substring(
            1,
            app.temp[index].name.lenght
          );
        }
        app.temp[index].name =
          app.temp[index].name.charAt(0).toUpperCase() +
          app.temp[index].name.slice(1);
        app.temp[index].name = app.temp[index].name.split('_').join(' ');
        app.temp[index].posterpath =
          'https://www.publicdomainpictures.net/pictures/280000/velka/not-found-image-15383864787lu.jpg';
        for (let i = 1930; i <= 2100; i = i + 1) {
          app.temp[index].name = app.temp[index].name.replace(
            '(' + i.toString() + ')',
            ''
          );
          app.temp[index].name = app.temp[index].name.replace(i.toString(), '');
          if (
            app.temp[index].name == '' ||
            app.temp[index].name == ' ' ||
            app.temp[index].name == '  ' ||
            app.temp[index].name == '   ' ||
            app.temp[index].name == '    '
          ) {
            app.temp[index].name = i.toString();
          }
        }
        const y = document.getElementById('wait');
        y.innerHTML = '<h3>Caricamento...' + app.temp[index].name + ' </h3>';
        await this.startCall(app.temp[index].name, index);
        try {
          app.temp[index].name = app.tmdb[index].title;
          app.temp[index].year = app.tmdb[index].release_date.substring(0, 4);
          app.temp[index].overview =
            app.tmdb[index].overview.substring(0, 160) + '...';
          app.temp[index].posterpath =
            'https://image.tmdb.org/t/p/w500' + app.tmdb[index].poster_path;
          app.temp[index].backdrop =
            'https://image.tmdb.org/t/p/original' +
            app.tmdb[index].backdrop_path;
          app.temp[index].allInfo = app.tmdb[index];
        } catch (error) {
          console.log(error);
        }
      }
      app.cards = JSON.parse(localStorage.getItem('cards'));
      this.visualCard();
      let difference = app.temp.filter(
        (item) => !app.cards.some((other) => item.id == other.id)
      );
      difference = app.removeDuplicate(difference);
      console.log(difference);
      app.cards = _.union(app.cards, difference);
      this.checkCard();
      app.totalFilm = app.cards.length;
      localStorage.setItem('cards', JSON.stringify(app.cards));
    },
    visualCard() {
      const x = document.getElementById('loader');
      const y = document.getElementById('wait');
      x.classList.remove('active');
      y.classList.remove('active');
    },
    resetVar() {
      app.next_page = true;
      app.token_drive = '';
      app.search_data = '';
      app.tmdb = [];
      app.temp = [];
    },
    removeDuplicate(films) {
      newFilm = films.filter(
        (film) =>
          film.id != '1gHH64FDRYoSfP3y6wh0Vf051qYA5CXn_' &&
          film.id != '1lv_ijehXflZUHCABI7S7I2i0jYeIuHnA' &&
          film.id != '12-Q8eKW-ryrhsSQ3dzMVWXhDTJhxV8VI' &&
          film.id != '1nwJz_SaeGgazR99VprK_2B1TRkyXGfKq' &&
          film.id != '18JKiPdO42lK4YcETmCHmBRY4Yc9cEari' &&
          film.id != '1z1aA9HfhRweQpxE8LTQy2S8SS1OQgx4_' &&
          film.id != '1CeEGEAJzb3wmgiF1ufiJ0ZKGBAvH0POm' &&
          film.id != '12HAPhRTXVKFSInNJll1rLFhLAU4rQ5YL'
      );
      return newFilm;
    },
    checkCard() {
      for (let index = 0; index < app.cards.length; index++) {
        if (app.cards[index].name.indexOf('(Part 1)') != -1) {
          for (let element of app.cards) {
            if (
              app.cards[index].name.replace('(Part 1)', '') ===
              element.name.replace('(Part 2)', '')
            ) {
              app.cards[index].id2 = element.id;
              app.cards[index].name = app.cards[index].name.replace(
                '(Part 1)',
                ''
              );
            }
          }
        }
      }
      for (let index = 0; index < app.cards.length; index++) {
        if (app.cards[index].name.indexOf('(Part 2)') != -1) {
          this.delete(index);
        }
      }
    },
    play() {
      if (app.login_flag == true) {
        this.authenticate().then(this.loadClient);
        app.login_flag = false;
      }
      const play1 = document.getElementsByClassName('playButton');
      const play2 = document.getElementsByClassName('playButton2');
      for (let index = 0; index < play1.length; index++) {
        play1[index].classList.add('active');
      }
      for (let index = 0; index < play2.length; index++) {
        play2[index].classList.add('active');
      }
    },
    dropdown() {
      document.getElementById('dropdown').classList.toggle('active');
    },
    filterGenre(id) {
      let temp = app.cards;
      app.cards = [];
      if (id == 'all') {
        app.cards = JSON.parse(localStorage.getItem('cards'));
        app.genre_flag = false;
      } else if (app.genre_flag == true) {
        let temp = JSON.parse(localStorage.getItem('cards'));
        temp.forEach((element) => {
          if (element.allInfo.genre_ids.includes(id) == true) {
            app.cards.push(element);
          }
        });
        app.genre_flag = true;
      } else {
        // console.log(id);
        temp.forEach((element) => {
          if (element.allInfo.genre_ids.includes(id) == true) {
            app.cards.push(element);
          }
        });
        app.genre_flag = true;
      }
      app.play();
    },
    async addInfo() {
      for (let index = 0; index < app.cards.length; index++) {
        console.log('Caricamento...' + app.cards[index]);
        await this.updateCall(
          app.cards[index].name,
          app.cards[index].year,
          index
        );
        try {
          app.cards[index].allInfo = app.tmdb[index];
          console.log(app.tmdb[index]);
        } catch (error) {
          console.log(error);
        }
      }
    },
    refreshCount() {
      app.totalFilm = app.cards.length;
    },
    download() {
      const a = document.createElement('a');
      const file = new Blob([JSON.stringify(app.cards)], {
        type: 'text/plain',
      });
      a.href = URL.createObjectURL(file);
      a.download = 'cards.json';
      a.click();
    },
    async idOpen(cardID) {
      // var x = document.getElementById('popup-container');
      app.id = 'https://drive.google.com/file/d/' + cardID + '/view';
      if (app.login_flag == true) {
        await this.authenticate().then(this.loadClient);
      }
      console.log(app.drive(cardID));
      window.open(app.id);
      // document.getElementById('video').classList.add('active');
      // // console.log(cardID);
      // x.classList.add("active");
    },
    idClose() {
      const x = document.getElementById('popup-container');
      //document.getElementById('video').classList.remove('active');
      document.getElementById('editForm').classList.remove('active');
      app.id = '';
      x.classList.remove('active');
    },
    editInfo(index) {
      if (app.search_flag == true) {
        app.index = index;
        const x = document.getElementById('popup-container');
        try {
          document.getElementById('video').classList.remove('active');
        } catch (e) {}
        x.classList.add('active');
        document.getElementById('editForm').classList.add('active');
        document.getElementById('title').value = app.cards[index].name;
        document.getElementById('year').value = app.cards[index].year;
        document.getElementById('overview').value = app.cards[index].overview;
      }
    },
    update() {
      app.temp = app.cards;
      app.cards = [];
      localStorage.clear();
      app.temp[app.index].name = document.getElementById('title').value;
      app.temp[app.index].year = document.getElementById('year').value;
      app.temp[app.index].overview = document.getElementById('overview').value;
      app.temp[app.index].posterpath = document.getElementById('image').value;
      app.cards = app.temp;
      app.temp = [];
      document.getElementById('editForm').classList.remove('active');
      localStorage.setItem('cards', JSON.stringify(app.cards));
      this.idClose();
    },
    async updateAuto() {
      let indexResponse = 0;
      let film = [];
      app.temp = app.cards;
      app.cards = [];
      localStorage.clear();
      app.tmdb = [];
      const x = prompt(
        'Quale film vuoi cercare?',
        document.getElementById('title').value
      );
      const y = prompt(
        'Anno di Uscita?',
        document.getElementById('year').value
      );
      await this.updateCall(x, y);
      this.checkArrayTmdb(indexResponse, app.tmdb.length);
      app.cards = app.temp;
      app.temp = [];
      document.getElementById('editForm').classList.remove('active');
      localStorage.setItem('cards', JSON.stringify(app.cards));
      this.idClose();
    },
    checkArrayTmdb(indexResponse, length) {
      if (length == 1) {
        try {
          app.temp[app.index].name = app.tmdb[indexResponse].title;
          app.temp[app.index].year = app.tmdb[
            indexResponse
          ].release_date.substring(0, 4);
          app.temp[app.index].overview =
            app.tmdb[indexResponse].overview.substring(0, 160) + '...';
          app.temp[app.index].posterpath =
            'https://image.tmdb.org/t/p/w500' +
            app.tmdb[indexResponse].poster_path;
          app.temp[app.index].backdrop =
            'https://image.tmdb.org/t/p/original' +
            app.tmdb[indexResponse].backdrop_path;
          app.temp[app.index].allInfo = app.tmdb[indexResponse];
        } catch (error) {
          console.log(error);
        }
      } else if (length > 1) {
        for (let index = 0; index < app.tmdb.length; index++) {
          console.log(
            index,
            app.tmdb[index].title,
            app.tmdb[index].release_date
          );
        }
        indexResponse = prompt('Che elemento vuoi salvare?', 0);
        try {
          app.temp[app.index].name = app.tmdb[indexResponse].title;
          app.temp[app.index].year = app.tmdb[
            indexResponse
          ].release_date.substring(0, 4);
          app.temp[app.index].overview =
            app.tmdb[indexResponse].overview.substring(0, 160) + '...';
          app.temp[app.index].posterpath =
            'https://image.tmdb.org/t/p/w500' +
            app.tmdb[indexResponse].poster_path;
          app.temp[app.index].backdrop =
            'https://image.tmdb.org/t/p/original' +
            app.tmdb[indexResponse].backdrop_path;
          app.temp[app.index].allInfo = app.tmdb[indexResponse];
        } catch (error) {
          console.log(error);
        }
      }
    },
    delete(index) {
      app.cards.splice(index, 1);
      localStorage.clear();
      localStorage.setItem('cards', JSON.stringify(app.cards));
    },
    search() {
      app.search_flag = false;
      let temp2 = [];
      app.temp = JSON.parse(localStorage.getItem('cards'));
      app.cards = [];
      for (const el of app.temp) {
        if (
          el.name.toLowerCase().indexOf(app.search_data.toLowerCase()) != -1
        ) {
          temp2 = temp2.concat(el);
        }
      }
      if (app.search_data == '') {
        temp2 = JSON.parse(localStorage.getItem('cards'));
        app.search_flag = true;
      }
      app.cards = temp2;
      app.totalFilm = app.cards.length;
    },
    orderByName() {
      app.cards.sort((a, b) => (a.name > b.name ? 1 : -1));
    },
    orderByYear() {
      app.cards.sort((a, b) => (a.year < b.year ? 1 : -1));
    },
    hover(obj) {
      const name = document.getElementById(obj.name);
      document.getElementById(obj.name).style.backgroundImage =
        'url(' + obj.backdrop + ')';
      name.classList.add('active');
      const overview = document.getElementById(obj.overview);
      overview.classList.add('active');
      const posterpath = document.getElementById(obj.posterpath);
      posterpath.classList.add('active');
    },
    hoverExit(obj, index) {
      setTimeout(() => {
        try {
          const name = document.getElementById(obj.name);
          name.classList.remove('active');
          const overview = document.getElementById(obj.overview);
          overview.classList.remove('active');
          const posterpath = document.getElementById(obj.posterpath);
          posterpath.classList.remove('active');
          document.getElementById(obj.name).style.backgroundImage = '';
        } catch (error) {}
      }, 5000);
    },
  },
});
