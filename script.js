//global AttObject that holds all info
let AttObj = {};
let GistId;
let GistToken;
let url = "https://api.github.com/gists/";

window.addEventListener("load", (event) => {
    //adding event listeners
    window.addEventListener("click", (event) => {
        if (event.target == document.getElementById("revert")) {
            hideModal("revert");
        } else if (event.target == document.getElementById("registerModal")) {
            hideModal("registerModal");
        }
    });
    document.getElementById("registerButton").addEventListener("click", () => {
        register();
        hideModal("registerModal");
    });
    document.getElementById('settings').addEventListener('click',()=>{
        document.getElementById('registerModal').style.visibility = 'visible';
    });
    // setup
    if (localStorage.getItem("AttObj") == null) {
        //setlastUpdate in registerItelf
        document.getElementById("registerModal").style.visibility = "visible";
    } else {
        GistId = localStorage.getItem("GistId");
        GistToken = localStorage.getItem("GistToken");
        getData();
    }
});

const hideModal = (id) => {
    document.getElementById(id).style.visibility = "hidden";
    document.getElementById("registerUsername").value = "";
    document.getElementById("registerGistId").value = "";
    document.getElementById("registerGistToken").value = "";
};
//sync will update screen alwaysAttObj") == null
const sync = (destination) => {
    //debug
    if (destination == "local") {
        localStorage.setItem("AttObj", `${JSON.stringify(AttObj)}`);
        // localStorage.setItem("lastSync", `${new Date().getTime()}`);
    } else {
        let Filename = localStorage.getItem("filename");
        console.debug(Filename);
        axios
            .patch(
                `${url}${GistId}`,
                {
                    files: {
                        [Filename]: {
                            content: JSON.stringify(AttObj),
                        },
                    },
                },
                {
                    headers: {
                        Authorization: `Bearer ${GistToken}`,
                    },
                }
            )
            .then((res) => {
                console.debug(res);
                console.debug("successsssssssss");
            })
            .catch((err) => {
                console.error(err);
            });
    }
    console.log(destination);
};
// display the todos from AttObj in screen inside main
const renderTodo = () => {
    let htmlToAdd = "";
    for (let key in AttObj) {
        let val = AttObj[key];
            htmlToAdd += `
        <div class="nonThemed todoContainer">
            <div class="percentContainer">
                <p id="todoTitle" class="centred">${key}</p>
                <p id="Fraction">${val.attended}/${val.total}</p>
            </div>
            <div class="buttons">
                <button onclick="addAttend('${key}')" class="done themed round"><i class="fas fa-check scale"></i></button>
                <button onclick="addTotal('${key}')" class="done themed round red"><i class="fas fa-times scale"></i></button>
                <button onclick="setRevertModal('${key}')" class="done themed round"><i class="fas fa-reply scale"></i></button>
            </div>
        </div>
            `;
    }
    document.getElementById("mainContent").innerHTML = htmlToAdd;
};
//basically change tag to deleted

const setRevertModal=(key)=>{
    document.getElementById('correct').setAttribute("onclick", `correctAttend('${key}')`);
    document.getElementById('wrong').setAttribute("onclick", `correctTotal('${key}')`);
    document.getElementById('revert').style.visibility = 'visible';
}

const correctAttend=(key)=>{
    AttObj[key].attended-=1;
    AttObj[key].total-=1;
    sync('local');
    sync('remote');
    hideModal('revert');
    renderTodo();
}
const correctTotal=(key)=>{
    AttObj[key].total-=1;
    sync('local');
    sync('remote');
    renderTodo();
    hideModal('revert');
}

const addAttend=(key)=>{
    AttObj[key].attended+=1;
    AttObj[key].total+=1;
    sync('local');
    renderTodo();
    sync('remote');
}
const addTotal=(key)=>{
    AttObj[key].total+=1;
    sync('local');
    renderTodo();
    sync('remote');
}
// registers the user with gist id and gist token
const register = () => {
    let username = document.getElementById("registerUsername").value;
    GistId = document.getElementById("registerGistId").value;
    GistToken = document.getElementById("registerGistToken").value;
    // validate step here
    localStorage.setItem("username", username);
    localStorage.setItem("GistId", GistId);
    localStorage.setItem("GistToken", GistToken);
    localStorage.setItem("lastSync", `${new Date().getTime()}`);
    //simulate request
    getData();
};
//gets data from remote and syncs with local
const getData = () => {
    //AttObj = JSON.parse('{"Networks":{"total":5,"attended":4},"DBMS":{"total":5,"attended":4},"Architecture":{"total":3,"attended":3},"AIML":{"total":2,"attended":2},"VR":{"total":4,"attended":4},"Cloud":{"total":5,"attended":4},"Honors":{"total":2,"attended":2},"Management":{"total":4,"attended":4},"DBMSLab":{"total":0,"attended":0},"NetworksLab":{"total":0,"attended":0}}');
    sync('local');
    renderTodo();
    axios
        .get(`${url}${GistId}`, {
            params: {
                t: new Date().getTime(),
            },
            headers:{
                Authorization: `token ${GistToken}`
            }
        })
        .then((res) => {
            console.debug(res);
            //assing res to AttObj
            let Filename = Object.keys(res.data.files)[0];
            localStorage.setItem("filename", Filename);
            AttObj = JSON.parse(res.data.files[Filename].content);
            sync("local");
            renderTodo();
        })
        .catch((err) => {
            console.error(err);
        });
};