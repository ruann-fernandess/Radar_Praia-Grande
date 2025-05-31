export function exibirAlertaErroERedirecionar(icon, title, mensagem, url) {
  Swal.fire({
    icon: icon,
    title: title,
    text: mensagem,
  }).then((result) => {
    if (result.isConfirmed) {
      window.location.href = url;
    }
  });
}

export function exibirAlertaErro(icon, title, mensagem) {
  Swal.fire({
    icon: icon,
    title: title,
    text: mensagem,
  });
}

export function exibirAlertaSucesso(title) {
  const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.onmouseenter = Swal.stopTimer;
      toast.onmouseleave = Swal.resumeTimer;
    }
  });

  Toast.fire({
    icon: "success",
    title: title
  });
}
