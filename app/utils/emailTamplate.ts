// utils/emailTemplates.ts
export function templateConfirmacaoPresenca(nomeUsuario: string) {
  return `
    <div style="font-family: sans-serif; text-align: center; background: #f7f7f7; padding: 2rem;">
      <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 12px; padding: 2rem; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
        <h1 style="color: #22c55e;">🎉 Presença Confirmada!</h1>
        <p>Olá <strong>${nomeUsuario}</strong>,</p>
        <p>Sua presença no Chá de Casa Nova de Vitória e Gerson foi confirmada com sucesso! Estamos ansiosos para celebrar juntos. 🥳</p>
        <p>Obrigado por fazer parte desse momento especial.</p>
        <a href="https://www.gerson-vieira-pedro.com.br/lista" style="display:inline-block; margin-top:1.5rem; padding:0.75rem 1.5rem; background:#22c55e; color:#fff; border-radius:8px; text-decoration:none;">Ver Lista de Presentes</a>
      </div>
    </div>
  `
}
