var app = new Vue({
    el: '#app',
    data: {
        search_data: '',
        menu_items:[{
            category: 'Animazione',
            link: '#'
        },
        {
            category: 'Avventura',
            link: '#'
        },
        {
            category: 'Azione',
            link: '#'
        },
        {
            category: 'Biografico',
            link: '#'
        },
        {
            category: 'Commedia',
            link: '#'
        },
        {
            category: 'Documentario',
            link: '#'
        },
        {
            category: 'Drammatico',
            link: '#'
        },
        {
            category: 'Erotico',
            link: '#'
        },
        {
            category: 'Fantascienza',
            link: '#'
        },
        {
            category: 'Fantasy/Fantastico',
            link: '#'
        },
        {
            category: 'Guerra',
            link: '#'
        },
        {
            category: 'Horror',
            link: '#'
        },
        {
            category: 'Musical',
            link: '#'
        },
        {
            category: 'Storico',
            link: '#'
        },
        {
            category: 'Thriller',
            link: '#'
        },
        {
            category: 'Western',
            link: '#'
        }],
        cards: [],
        id: '',
        temp: [],
        v: 0,
        c: true,
        login_flag: true,
        api_key_tmdb: '65d98f1b94ec4cf5a93baed84de2047b',
        token_drive: ''
    },
    mounted: function(){
        gapi.load("client:auth2", function() {
            gapi.auth2.init({client_id: "114084790467-km976fe3h5sd8t9bb8uc52cm3ohi6je8.apps.googleusercontent.com"});
        });
        var x=localStorage.getItem('cards')
        if(x != null){
            this.cards= JSON.parse(localStorage.getItem('cards'));
        }else{
           
            setTimeout(() => {
                this.login();
            }, 2500);   
        }
    },
    methods:{
        authenticate() {
            return gapi.auth2.getAuthInstance()
                .signIn({scope: "https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/drive.appdata https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.metadata https://www.googleapis.com/auth/drive.metadata.readonly https://www.googleapis.com/auth/drive.photos.readonly https://www.googleapis.com/auth/drive.readonly"})
                .then(function() { console.log("Sign-in successful"); },
                      function(err) { console.error("Error signing in", err); });
        },
        loadClient() {
            gapi.client.setApiKey("AIzaSyDXsuMWl-wmaaVw096uAsbC_67fG4wlqTU");
            return gapi.client.load("https://content.googleapis.com/discovery/v1/apis/drive/v3/rest")
                .then(function() { console.log("GAPI client loaded for API"); },
                      function(err) { console.error("Error loading GAPI client for API", err); });
        },
        execute() {
            if(app.search_data==''){
                app.search_data="mimeType != 'application/vnd.google-apps.folder' and parents in '1va8p3VqGDys624xvsXyramu5SJn0fYVZ'"
            }else{
                var x = app.search_data;
                app.search_data= "name contains '"+x+"' and parents in '1va8p3VqGDys624xvsXyramu5SJn0fYVZ'";
                x=null;
            }
            return gapi.client.drive.files.list({
              "corpora": "drive",
              "driveId": "0AHXjPMhMm0n1Uk9PVA",
              "includeItemsFromAllDrives": true,
              "includeTeamDriveItems": true,
              "pageSize": 1000,
              "supportsAllDrives": true,
              "supportsTeamDrives": true,
              "teamDriveId": "0AHXjPMhMm0n1Uk9PVA",
              "q": app.search_data,
              "pageToken": app.token_drive,
            })
                .then(function(response) {
                                      
                        console.log("Response", response);
                        app.temp = response.result.files.concat(app.temp);
                        app.token_drive= response.result.nextPageToken;
                        if (app.v != 0){
                            if (app.token_drive === undefined){
                                app.c=false;
                            }
                        }
                        app.search_data="";
                        app.v = 1;                       
                },
                function(err) {
                    console.error("Execute error", err);
                    app.c=false;

                });               
        },
        flag(){
            app.login_flag=false;
        },
        login() {
            app.cards= [];
            localStorage.clear();
            if (app.login_flag==true){
            this.authenticate().then(this.loadClient).then(this.execute).then( () =>{
                setTimeout(() => {
                    if (app.c==true){
                        this.login();
                    }
                },2000); 
            });
            this.flag();
        
            }else{
                this.execute().then( () =>{            
                    setTimeout(() => {
                        if (app.c == true){
                            this.login();
                        }else{
                        app.temp.sort((a, b) => (a.name > b.name) ? 1 : -1);
                        app.temp.forEach((film, index) => {
                            app.temp[index].name=film.name.toLowerCase(); 
                        });
                        app.cards=app.temp;
                        localStorage.setItem('cards', JSON.stringify(app.cards));                        
                        app.token_drive='';
                        app.temp = [];
                        }
                    },1000); 
                });
            }        
        },
        idOpen(cardID){
            console.log(cardID); 
            app.id = "https://drive.google.com/file/d/"+ cardID + "/preview";
            x.classList.add("active");
        },
        startCall() {
            axios.get('https://api.themoviedb.org/3/search/movie',{
                params:{
                    api_key: this.api_key_tmdb,
                    language: 'it-IT',
                    query: 'Ip',                   
                }
            }).then(function(response){
                console.log(response);
            });
        }
    }  
});


