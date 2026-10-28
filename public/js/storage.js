let volumes=JSON.parse(localStorage.getItem("volumes"))||[];

render();

function render(){

const table=document.getElementById("volumeTable");

table.innerHTML="";

volumes.forEach((v,index)=>{

table.innerHTML+=`

<tr>

<td>${v.name}</td>

<td>${v.size} GB</td>

<td class="${v.status=="Available"?"green":"orange"}">

${v.status}

</td>

<td>${v.attach}</td>

<td>

<button onclick="deleteVolume(${index})">

Delete

</button>

</td>

</tr>

`;

});

}

function openPopup(){

popup.style.display="flex";

}

function closePopup(){

popup.style.display="none";

}

function createVolume(){

const volume={

name:volumeName.value,

size:volumeSize.value,

attach:attachedTo.value,

status:"Provisioning"

};

volumes.push(volume);

render();

closePopup();

setTimeout(()=>{

volume.status="Available";

render();

},3000);

}

function deleteVolume(index){

volumes.splice(index,1);

render();

}