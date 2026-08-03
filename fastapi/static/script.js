const btnListarAsesores = document.getElementById("btnListarAsesores");
const contenedorAsesores = document.getElementById("contenedorAsesores")

async function cargarLeadsPorAsesor(idAsesor) {
    try {
        const response = await fetch(`/leads_por_asesor?id_asesor=${idAsesor}`);

        if(!response.ok) {
            throw new Error(`Error en la petición: ${response.status}`);
        }

        const leads = await response.json();

        console.log("Lista de leads obtenida: ", leads);
        return leads;
    }catch(error){
        console.error("Hubo un error al cargar los leads. ", error);
    }
}

async function listarInformacionAsesores(){
    try {
        const response = await fetch(`/listar_asesores`);

        if(!response.ok) {
            throw new Error(`Error en la petición: ${response.status}`);
        }

        const asesores = await response.json();
        console.log("Lista de asesores obtenida: ", asesores);
        return asesores;
    }catch(error){
        console.error("Hubo un error al cargar los asesores. ", error);
    }
}


async function ejecutarCierreLead(idLead, estado) {
    try{
        const response = await fetch('/cerrar_lead', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id_lead: idLead,
                estado_lead: estado
            })
        });

        if(!response.ok){
            throw new Error(`No se pudo cerrar el lead. Status: ${response.status}`);
        }

        const resultado = await response.json();

        console.log("Lead cerrado exitosamente: ", resultado);
        return resultado
    } catch(error) {
        console.error("Error al cerrar el lead", error);
    }
}

function renderizarAsesores(listaAsesores){
    contenedorAsesores.innerHTML = "";
    
    if(!listaAsesores || listaAsesores.length === 0){
        contenedorAsesores.innerHTML = "<li>No hay asesores registrados.</li>";
        return; 
    }
    
    listaAsesores.forEach(asesor => {
        const li = document.createElement("li");
        li.textContent = `Asesor: ${asesor.nombre_asesor}, ID: ${asesor.id_asesor}`;
        
        contenedorAsesores.appendChild(li);
    });
}

btnListarAsesores.addEventListener("click", async () => {

    const asesores = await listarInformacionAsesores();

    if (asesores) {
        renderizarAsesores(asesores);
    }
});