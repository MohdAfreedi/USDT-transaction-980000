let databases=JSON.parse(localStorage.getItem("databases"))||[];

render();

function render(){

const table=document.getElementById("databaseTable");

table.innerHTML="";

databases.forEach((db,index)=>{

table.innerHTML+=`

<tr>

<td>${db.name}</td>

<td>${db.type}</td>

<td class="${db.status=="Available"?"green":"orange"}">

${db.status}

</td>

<td>${db.version}</td>

<td>${db.storage} GB</td>

<td>

<button onclick="deleteDB(${index})">

Delete

</button>

</td>

</tr>

`;

});

}



function openPopup(){

document.getElementById("popup").style.display="flex";

}



function closePopup(){

document.getElementById("popup").style.display="none";

}



function createDatabase(){

const db={

name:dbName.value,

type:dbType.value,

version:dbVersion.value,

storage:dbStorage.value,

status:"Provisioning"

};

databases.push(db);

render();

closePopup();

setTimeout(()=>{

db.status="Available";

render();

},4000);

}



function deleteDB(i){

databases.splice(i,1);

render();

}   