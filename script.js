document.addEventListener("DOMContentLoaded", function () {
    
    let db;
    const request = window.indexedDB.open("notasDB", 1);

    request.onerror = function (event) {
        console.error("Error al abrir la base de datos:", event.target.errorCode);
    };

    request.onupgradeneeded = function (event) {
        db = event.target.result;
        const objectStore = db.createObjectStore("notas", { keyPath: "id", autoIncrement: true });
        objectStore.createIndex("texto", "texto", { unique: false });
    };

    request.onsuccess = function (event) {
        db = event.target.result;

        cargarNotas();
    };

    function agregarNotaEnDB(texto) {
        const transaction = db.transaction(["notas"], "readwrite");
        const objectStore = transaction.objectStore("notas");
        const nuevaNota = { texto: texto };

        const request = objectStore.add(nuevaNota);

        request.onsuccess = function (event) {
            console.log("Nota agregada correctamente a la base de datos.");
        };

        request.onerror = function (event) {
            console.error("Error al agregar la nota a la base de datos:", event.target.errorCode);
        };
    }

    function cargarNotas() {
        const transaction = db.transaction(["notas"], "readonly");
        const objectStore = transaction.objectStore("notas");

        const request = objectStore.openCursor();

        request.onsuccess = function (event) {
            const cursor = event.target.result;

            if (cursor) {

                const newNote = document.createElement("div");
                newNote.classList.add("note");
                newNote.innerHTML = `
                    <div class="cabecera">
                        <div class="icono delete"> <img src="papelera.png" alt=""> </div>
                    </div>
                    <textarea class="text">${cursor.value.texto}</textarea>
                `;
                document.querySelector('.principal').appendChild(newNote);

                const deleteIcon = newNote.querySelector('.icono.delete');
                deleteIcon.addEventListener('click', function () {
                   
                    eliminarNota(cursor.value.id, newNote);
                });

                
                cursor.continue();
            }
        };

        request.onerror = function (event) {
            console.error("Error al cargar las notas desde la base de datos:", event.target.errorCode);
        };
    }

    function eliminarNota(id, noteElement) {
        const transaction = db.transaction(["notas"], "readwrite");
        const objectStore = transaction.objectStore("notas");

        const request = objectStore.delete(id);

        request.onsuccess = function (event) {
            console.log("Nota eliminada correctamente de la base de datos.");

        
            document.querySelector('.principal').removeChild(noteElement);
        };

        request.onerror = function (event) {
            console.error("Error al eliminar la nota de la base de datos:", event.target.errorCode);
        };
    }


    const addButton = document.querySelector('.add');
    addButton.addEventListener('click', function () {
        const newNote = document.createElement('div');
        newNote.classList.add('note');
        newNote.innerHTML = `
            <div class="cabecera">
                <div class="icono delete"> <img src="papelera.png" alt=""> </div>
            </div>
            <textarea class="text"></textarea>
        `;

        document.querySelector('.principal').appendChild(newNote);

        const deleteIcon = newNote.querySelector('.icono.delete');
        const textarea = newNote.querySelector('.text');

    
        deleteIcon.addEventListener('click', function () {
            document.querySelector('.principal').removeChild(newNote);
        });

       
        textarea.addEventListener('blur', function () {
            agregarNotaEnDB(textarea.value);
        });
    });
});


