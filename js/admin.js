let usuarioAtual = null;


/* ================================
   AUTENTICAÇÃO
================================ */

auth.onAuthStateChanged(user => {

    if (!user) {
        window.location.href = "index.html";
        return;
    }

    usuarioAtual = user;

    db.collection("usuarios")
        .doc(user.uid)
        .get()
        .then(doc => {

            if (!doc.exists || doc.data().perfil !== "admin") {

                alert("Acesso negado.");
                window.location.href = "index.html";

                return;
            }

            carregarProdutos();
            carregarUsuarios();

        })
        .catch(error => {

            console.error(
                "Erro ao verificar administrador:",
                error
            );

            alert("Erro ao verificar acesso.");
            window.location.href = "index.html";

        });

});


/* ================================
   LOGOUT
================================ */

function logout() {

    auth.signOut()
        .then(() => {

            window.location.href = "index.html";

        })
        .catch(error => {

            console.error(
                "Erro ao sair:",
                error
            );

            alert("Não foi possível sair.");

        });

}


/* ================================
   IMAGEM
================================ */

function alternarEntradaImagem() {

    const tipo =
        document.getElementById("tipoImagem").value;

    const imagemURL =
        document.getElementById("imagemURL");

    const imagemArquivo =
        document.getElementById("imagemArquivo");

    imagemURL.classList.toggle(
        "d-none",
        tipo !== "url"
    );

    imagemArquivo.classList.toggle(
        "d-none",
        tipo !== "arquivo"
    );

}


/* ================================
   CARREGAR PRODUTOS
================================ */

function carregarProdutos() {

    db.collection("produtos")
        .get()
        .then(snapshot => {

            let html = "";

            if (snapshot.empty) {

                html = `
                    <div style="
                        grid-column:1/-1;
                        text-align:center;
                        background:white;
                        padding:30px;
                        border-radius:18px;
                    ">
                        <h3 style="color:#ff4f87;">
                            Nenhum produto cadastrado.
                        </h3>

                        <p>
                            Clique em "Adicionar Produto"
                            para cadastrar o primeiro.
                        </p>
                    </div>
                `;

            }

            snapshot.forEach(doc => {

                const p = doc.data();

                const nome =
                    escapeHTML(p.nome || "Produto");

                const imagem =
                    escapeHTML(
                        p.imagem ||
                        "https://via.placeholder.com/600x400?text=Doceria+Encanto"
                    );

                const preco =
                    Number(p.preco || 0);

                const estoque =
                    Number(p.estoque || 0);

                html += `

                    <div class="produto">

                        <img
                            src="${imagem}"
                            alt="${nome}"
                            onerror="this.src='https://via.placeholder.com/600x400?text=Imagem+indisponivel'"
                        >

                        <div class="produto-conteudo">

                            <h3>
                                ${nome}
                            </h3>

                            <p>
                                <strong>Preço:</strong>
                                R$ ${preco.toFixed(2).replace(".", ",")}
                            </p>

                            <p>
                                <strong>Estoque:</strong>
                                ${estoque}
                            </p>

                            <div class="acoes-produto">

                                <button
                                    class="btn-editar"
                                    onclick="editarProduto(
                                        '${doc.id}',
                                        ${JSON.stringify(p.nome || "")},
                                        ${preco},
                                        ${estoque},
                                        ${JSON.stringify(p.imagem || "")}
                                    )">
                                    ✏️ Editar
                                </button>

                                <button
                                    class="btn-excluir"
                                    onclick="excluirProduto('${doc.id}')">
                                    🗑️ Excluir
                                </button>

                            </div>

                        </div>

                    </div>

                `;

            });

            document.getElementById(
                "lista-produtos"
            ).innerHTML = html;

            mostrarMensagem(
                "Produtos carregados com sucesso.",
                "info"
            );

        })
        .catch(error => {

            console.error(
                "Erro ao carregar produtos:",
                error
            );

            mostrarMensagem(
                "Erro ao carregar produtos.",
                "danger"
            );

        });

}


/* ================================
   FORMULÁRIO
================================ */

function mostrarFormulario() {

    const formulario =
        document.getElementById("form-produto");

    formulario.classList.add("ativo");

    document.getElementById(
        "id-produto"
    ).value = "";

    document.getElementById(
        "nome"
    ).value = "";

    document.getElementById(
        "preco"
    ).value = "";

    document.getElementById(
        "estoque"
    ).value = "";

    document.getElementById(
        "imagemURL"
    ).value = "";

    document.getElementById(
        "imagemArquivo"
    ).value = "";

    document.getElementById(
        "tipoImagem"
    ).value = "url";

    alternarEntradaImagem();

    formulario.scrollIntoView({
        behavior: "smooth"
    });

}


function cancelarFormulario() {

    document
        .getElementById("form-produto")
        .classList.remove("ativo");

}


/* ================================
   SALVAR PRODUTO
================================ */

function salvarProduto() {

    const id =
        document.getElementById(
            "id-produto"
        ).value;

    const nome =
        document.getElementById(
            "nome"
        ).value.trim();

    const preco =
        parseFloat(
            document.getElementById(
                "preco"
            ).value
        );

    const estoque =
        parseInt(
            document.getElementById(
                "estoque"
            ).value
        );

    const tipoImagem =
        document.getElementById(
            "tipoImagem"
        ).value;

    const imagemURL =
        document.getElementById(
            "imagemURL"
        ).value.trim();

    const imagemArquivo =
        document.getElementById(
            "imagemArquivo"
        ).files[0];


    if (
        !nome ||
        isNaN(preco) ||
        isNaN(estoque)
    ) {

        alert(
            "Preencha corretamente nome, preço e estoque."
        );

        return;
    }


    if (preco < 0) {

        alert(
            "O preço não pode ser negativo."
        );

        return;
    }


    if (estoque < 0) {

        alert(
            "O estoque não pode ser negativo."
        );

        return;
    }


    if (
        tipoImagem === "url" &&
        imagemURL
    ) {

        const dados = {

            nome: nome,
            preco: preco,
            estoque: estoque,
            imagem: imagemURL

        };

        salvarOuAtualizar(
            id,
            dados
        );

        return;
    }


    if (
        tipoImagem === "arquivo" &&
        imagemArquivo
    ) {

        const nomeArquivo =
            Date.now() +
            "_" +
            imagemArquivo.name;

        const storageRef =
            storage.ref(
                "produtos/" + nomeArquivo
            );


        mostrarMensagem(
            "Enviando imagem...",
            "info"
        );


        storageRef
            .put(imagemArquivo)
            .then(snapshot => {

                return snapshot.ref
                    .getDownloadURL();

            })
            .then(url => {

                const dados = {

                    nome: nome,
                    preco: preco,
                    estoque: estoque,
                    imagem: url

                };

                salvarOuAtualizar(
                    id,
                    dados
                );

            })
            .catch(error => {

                console.error(
                    "Erro ao enviar imagem:",
                    error
                );

                mostrarMensagem(
                    "Erro ao enviar a imagem.",
                    "danger"
                );

            });

        return;
    }


    /*
       Se estiver editando e não escolher
       uma nova imagem, mantém a imagem atual.
    */

    if (id) {

        const imagemAtual =
            document.getElementById(
                "imagemURL"
            ).value.trim();

        if (imagemAtual) {

            const dados = {

                nome: nome,
                preco: preco,
                estoque: estoque,
                imagem: imagemAtual

            };

            salvarOuAtualizar(
                id,
                dados
            );

            return;
        }
    }


    alert(
        "Selecione uma imagem por URL ou escolha um arquivo do computador."
    );

}


/* ================================
   ADICIONAR / ATUALIZAR
================================ */

function salvarOuAtualizar(
    id,
    dados
) {

    if (id) {

        db.collection("produtos")
            .doc(id)
            .update(dados)
            .then(() => {

                mostrarMensagem(
                    "Produto atualizado com sucesso!",
                    "success"
                );

                cancelarFormulario();
                carregarProdutos();

            })
            .catch(error => {

                console.error(
                    "Erro ao atualizar produto:",
                    error
                );

                mostrarMensagem(
                    "Erro ao atualizar produto.",
                    "danger"
                );

            });

        return;
    }


    db.collection("produtos")
        .add(dados)
        .then(() => {

            mostrarMensagem(
                "Produto adicionado com sucesso!",
                "success"
            );

            cancelarFormulario();
            carregarProdutos();

        })
        .catch(error => {

            console.error(
                "Erro ao adicionar produto:",
                error
            );

            mostrarMensagem(
                "Erro ao adicionar produto.",
                "danger"
            );

        });

}


/* ================================
   EDITAR PRODUTO
================================ */

function editarProduto(
    id,
    nome,
    preco,
    estoque,
    imagem
) {

    document
        .getElementById("form-produto")
        .classList.add("ativo");


    document.getElementById(
        "id-produto"
    ).value = id;


    document.getElementById(
        "nome"
    ).value = nome;


    document.getElementById(
        "preco"
    ).value = preco;


    document.getElementById(
        "estoque"
    ).value = estoque;


    document.getElementById(
        "imagemURL"
    ).value = imagem;


    document.getElementById(
        "imagemArquivo"
    ).value = "";


    document.getElementById(
        "tipoImagem"
    ).value = "url";


    alternarEntradaImagem();


    document
        .getElementById("form-produto")
        .scrollIntoView({
            behavior: "smooth"
        });

}


/* ================================
   EXCLUIR PRODUTO
================================ */

function excluirProduto(id) {

    if (
        !confirm(
            "Deseja realmente excluir este produto?"
        )
    ) {
        return;
    }


    db.collection("produtos")
        .doc(id)
        .delete()
        .then(() => {

            mostrarMensagem(
                "Produto excluído com sucesso!",
                "danger"
            );

            carregarProdutos();

        })
        .catch(error => {

            console.error(
                "Erro ao excluir produto:",
                error
            );

            mostrarMensagem(
                "Erro ao excluir produto.",
                "danger"
            );

        });

}


/* ================================
   MENSAGENS
================================ */

function mostrarMensagem(
    texto,
    tipo
) {

    const el =
        document.getElementById(
            "mensagem"
        );


    el.className =
        "mensagem " + tipo;


    el.textContent = texto;


    clearTimeout(
        window.timerMensagem
    );


    window.timerMensagem =
        setTimeout(() => {

            el.style.display = "none";

        }, 3000);


    el.style.display = "block";

}


/* ================================
   USUÁRIOS
================================ */

function carregarUsuarios() {

    db.collection("usuarios")
        .get()
        .then(snapshot => {

            let html = "";


            if (snapshot.empty) {

                html = `
                    <p style="
                        text-align:center;
                        padding:20px;
                    ">
                        Nenhum usuário cadastrado.
                    </p>
                `;

            }


            snapshot.forEach(doc => {

                const u =
                    doc.data();

                const email =
                    escapeHTML(
                        u.email ||
                        "Email não disponível"
                    );

                const isAdmin =
                    u.perfil === "admin";


                html += `

                    <div class="usuario">

                        <span>
                            📧 ${email}
                        </span>

                        ${
                            isAdmin

                            ?

                            `
                            <span class="badge-admin">
                                Administrador
                            </span>
                            `

                            :

                            `
                            <button
                                class="btn-promover"
                                onclick="promover('${doc.id}')">
                                Tornar Admin
                            </button>
                            `
                        }

                    </div>

                `;

            });


            document.getElementById(
                "lista-usuarios"
            ).innerHTML = html;

        })
        .catch(error => {

            console.error(
                "Erro ao carregar usuários:",
                error
            );

            mostrarMensagem(
                "Erro ao carregar usuários.",
                "danger"
            );

        });

}


/* ================================
   PROMOVER USUÁRIO
================================ */

function promover(uid) {

    if (
        !confirm(
            "Deseja tornar este usuário administrador?"
        )
    ) {
        return;
    }


    db.collection("usuarios")
        .doc(uid)
        .update({
            perfil: "admin"
        })
        .then(() => {

            mostrarMensagem(
                "Usuário promovido a administrador.",
                "success"
            );

            carregarUsuarios();

        })
        .catch(error => {

            console.error(
                "Erro ao promover usuário:",
                error
            );

            mostrarMensagem(
                "Erro ao promover usuário.",
                "danger"
            );

        });

}


/* ================================
   SEGURANÇA DE TEXTO
================================ */

function escapeHTML(texto) {

    return String(texto)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}