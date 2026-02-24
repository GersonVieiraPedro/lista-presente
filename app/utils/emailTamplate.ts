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

export function templateConfirmacaoReservaPresente(
  nomeUsuario: string,
  nomeItem: string,
  imagemUrl: string,
  linkPortal: string,
  notaNoivos?: string,
  linkItemExterno?: string,
  preco?: number,
  numeroReserva?: string,
  dataReserva?: string,
) {
  const precoFormatado = preco ? `R$ ${preco.toFixed(2).replace('.', ',')}` : ''

  return `
  <div style="margin:0; padding:0; background:#f4f4f5; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">

    <div style="max-width:620px; margin:60px auto; background:#ffffff; border-radius:20px; box-shadow:0 20px 60px rgba(0,0,0,0.06); overflow:hidden;">

      <!-- HEADER -->
      <div style="padding:30px 40px; border-bottom:1px solid #e5e7eb;">
        <h2 style="margin:0; font-size:14px; letter-spacing:2px; color:#808080; text-transform:uppercase;">
          Confirmação de Reserva de Presente 🎁
        </h2>

        ${
          numeroReserva
            ? `<p style="margin:8px 0 0 0; font-size:12px; color:#9ca3af;">
                Nº Reserva: ${numeroReserva}
               </p>`
            : ''
        }

        ${
          dataReserva
            ? `<p style="margin:4px 0 0 0; font-size:12px; color:#9ca3af;">
                Data: ${dataReserva}
               </p>`
            : ''
        }

      </div>

      <!-- BODY -->
      <div style="padding:40px; text-align:center;">

        <h1 style="font-size:20px; margin-bottom:10px; color:#111;">
          Olá ${nomeUsuario},
        </h1>

        <p style="font-size:14px; color:#6b7280; line-height:1.6; margin-bottom:35px;">
          Confirmamos sua reserva no presente abaixo.<br>
          Ficamos muito felizes com esse gesto e com o carinho
          envolvido nessa escolha. 💛
        </p>

        <!-- ITEM CENTRAL -->
        <div style="margin:30px 0;">

          <img src="${imagemUrl}"
               alt="${nomeItem}"
               style="width:180px; height:180px; object-fit:cover; border-radius:50%; box-shadow:0 10px 25px rgba(0,0,0,0.1);">

          <h3 style="margin-top:25px; font-size:18px; color:#111;">
            ${nomeItem}
          </h3>

          <p style="margin-top:5px; font-size:15px; font-weight:600; color:#374151;">
            ${precoFormatado}
          </p>
          ${
            notaNoivos
              ? `<p style="margin:4px 0 0 0; font-size:15px; color:#9ca3af;">
        Nota dos Noivos: ${notaNoivos}
        </p>`
              : ''
          }
        ${
          linkItemExterno
            ? `        <div style="margin-top:45px;">
          <a href="${linkItemExterno}"
             style="display:inline-block; padding:12px 26px; background:#eff428; color:#4a4a4a; text-decoration:none; border-radius:30px; font-size:10px; letter-spacing:1px;">
            Clique aqui para ver detalhes do presente no Mercado Livre
          </a>
        </div>`
            : ''
        }

        </div>

        <!-- DIVIDER -->
        <div style="height:1px; background:#e5e7eb; margin:40px 0;"></div>

        <!-- INFO BLOCO -->
        <div style="text-align:left; font-size:13px; color:#6b7280; line-height:1.6;">

          <p style="margin:0 0 10px 0;">
            <strong style="color:#111;">Responsabilidade de Compra:</strong>
          </p>

          <p style="margin:0;">
            <p style="margin:0;">A compra desse presente será realizada fora da plataforma.</p>
            <p style="margin:0;">A responsabilidade pela compra e entrega é exclusivamente sua.</p>
            <p style="margin:0;">Esse presente está reservado para você, outros convidados não poderão presentear o mesmo item.</p>
          </p>

          <div style="margin-top:30px;">
            <strong style="color:#111;">Padrão de Cores Preferencial:</strong>
          </div>
          <div style="margin-top:15px;">

            <table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
              <tr>

                <td style="padding-right:20px; padding-bottom:10px;">
                  <span style="display:inline-block; width:14px; height:14px; border-radius:50%; background:linear-gradient(145deg,#e6eef2,#b8c2cc); border:1px solid #cfd8dc; vertical-align:middle;"></span>
                  <span style="font-size:14px; color:#444; margin-left:6px;">Inox</span>
                </td>

                <td style="padding-right:20px; padding-bottom:10px;">
                  <span style="display:inline-block; width:14px; height:14px; border-radius:50%; background:#cfd6dc; border:1px solid #b6bec5; vertical-align:middle;"></span>
                  <span style="font-size:14px; color:#444; margin-left:6px;">Prateado</span>
                </td>
              
                <td style="padding-right:20px; padding-bottom:10px;">
                  <span style="display:inline-block; width:14px; height:14px; border-radius:50%; background:#8e9aa3; border:1px solid #7b8790; vertical-align:middle;"></span>
                  <span style="font-size:14px; color:#444; margin-left:6px;">Aço Escovado</span>
                </td>

                <td style="padding-right:20px; padding-bottom:10px;">
                  <span style="display:inline-block; width:14px; height:14px; border-radius:50%; background:#4b5563; border:1px solid #374151; vertical-align:middle;"></span>
                  <span style="font-size:14px; color:#444; margin-left:6px;">Cinza</span>
                </td>

                <td style="padding-bottom:10px;">
                  <span style="display:inline-block; width:14px; height:14px; border-radius:50%; background:#1f2937; border:1px solid #111827; vertical-align:middle;"></span>
                  <span style="font-size:14px; color:#444; margin-left:6px;">Preto</span>
                </td>

              </tr>
            </table>

          </div>
        </div>

        <!-- BUTTON -->
        <div style="margin-top:45px;">
          <a href="${linkPortal}"
             style="display:inline-block; padding:12px 26px; background:#111; color:#fff; text-decoration:none; border-radius:30px; font-size:13px; letter-spacing:1px;">
            Clique aqui para ver a mensagem do casal
          </a>
        </div>

        <!-- EXTRA MESSAGE -->
        <p style="margin-top:30px; font-size:12px; color:#9ca3af;">
          Se tiver qualquer dúvida ou precisar de ajuda, entre em contato conosco. Estamos aqui para garantir que tudo corra perfeitamente!  💌
        </p>
        <p> Obrigado !!!</p>

      </div>

      <!-- FOOTER -->
      <div style="padding:20px; background:#f9fafb; text-align:center; font-size:11px; color:#9ca3af;">
        Chá de Casa Nova • Vitória & Gerson
      </div>

    </div>

  </div>
  `
}
