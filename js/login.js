const formLogin = document.getElementById("form-login");

const mensagem = document.getElementById("mensagem");

const btnLogin = document.getElementById("btn-login");


formLogin.addEventListener("submit", async function(event) {

    event.preventDefault();


    const email = document.getElementById("email").value.trim();

    const senha = document.getElementById("senha").value;


    if (!email || !senha) {

        mostrarMensagem(
            "Preencha o e-mail e a senha.",
            "erro"
        );

        return;
    }


    btnLogin.disabled = true;

    btnLogin.textContent = "Entrando...";


    try {

        // Faz login no Firebase Authentication

        const resultado = await auth.signInWithEmailAndPassword(
            email,
            senha
        );


        const user = resultado.user;


        // Procura o usuário no Firestore

        const documento = await db
            .collection("usuarios")
            .doc(user.uid)
            .get();


        // Usuário não possui cadastro no Firestore

        if (!documento.exists) {

            await auth.signOut();

            mostrarMensagem(
                "Usuário não cadastrado no sistema.",
                "erro"
            );

            btnLogin.disabled = false;

            btnLogin.textContent = "🔐 Entrar";

            return;
        }


        const dadosUsuario = documento.data();


        // Verifica se é administrador

        if (dadosUsuario.perfil !== "admin") {

            await auth.signOut();

            mostrarMensagem(
                "Acesso negado. Este usuário não é administrador.",
                "erro"
            );

            btnLogin.disabled = false;

            btnLogin.textContent = "🔐 Entrar";

            return;
        }


        // Administrador autorizado

        mostrarMensagem(
            "Login realizado! Entrando no painel...",
            "sucesso"
        );


        setTimeout(function() {

            window.location.href = "admin.html";

        }, 800);


    } catch (erro) {

        console.error("Erro no login:", erro);


        let mensagemErro =
            "Não foi possível realizar o login.";


        if (erro.code === "auth/invalid-credential") {

            mensagemErro =
                "E-mail ou senha incorretos.";

        }

        else if (erro.code === "auth/user-not-found") {

            mensagemErro =
                "Usuário não encontrado.";

        }

        else if (erro.code === "auth/wrong-password") {

            mensagemErro =
                "Senha incorreta.";

        }

        else if (erro.code === "auth/invalid-email") {

            mensagemErro =
                "Digite um e-mail válido.";

        }

        else if (erro.code === "auth/too-many-requests") {

            mensagemErro =
                "Muitas tentativas. Aguarde alguns minutos.";

        }


        mostrarMensagem(
            mensagemErro,
            "erro"
        );


        btnLogin.disabled = false;

        btnLogin.textContent = "🔐 Entrar";

    }

});


function mostrarMensagem(texto, tipo) {

    mensagem.textContent = texto;

    mensagem.className = tipo;

    mensagem.style.display = "block";

}