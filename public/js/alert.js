export async function exibirAlertaErroERedirecionar(icon, title, mensagem, url) {
  const result = await Swal.fire({
    icon: icon,
    title: title,
    text: mensagem,
    showConfirmButton: true,
    confirmButtonText: "OK",
    allowOutsideClick: false,
    allowEscapeKey: false,
  });
  if (result.isConfirmed) {
    window.location.href = url;
  }
}

export async function exibirAlertaErro(icon, title, mensagem) {
  await Swal.fire({
    icon: icon,
    title: title,
    text: mensagem,
  });
}

export async function exibirAlertaConfirmar(titulo, mensagem) {
  const resultado = await Swal.fire({
    title: titulo,
    text: mensagem,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sim, excluir',
    cancelButtonText: 'Cancelar',
    reverseButtons: true,
  });

  return resultado.isConfirmed;
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
