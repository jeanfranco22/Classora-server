/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable } from '@nestjs/common';
import { transporter } from '../config/mailer.config';
import { User } from 'src/users/users.entity';

@Injectable()
export class NotificationsService {
  async sendWelcomeEmail(name: string, email: string) {
    await transporter.sendMail({
      from: '"PowerGym" <gympower.ok@gmail.com>',
      to: email,
      subject: '¡Bienvenido a PowerGym! 💪',
      html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #ff6600; font-size: 28px;">¡Bienvenido a PowerGym, ${name}!</h1>
            <p style="font-size: 16px; line-height: 1.6;">Nos alegra tenerte en nuestra comunidad. Tu cuenta ha sido creada exitosamente.</p>
            <p style="font-size: 16px; line-height: 1.6;">Ya puedes comenzar a explorar nuestras clases y reservar tu lugar.</p>
            <p style="font-size: 14px; color: #888;">El equipo de PowerGym</p>
            </div>`,
    });
  }

  async sendUpdateEmail(name: string, email: string) {
    await transporter.sendMail({
      from: '"PowerGym" <gympower.ok@gmail.com>',
      to: email,
      subject: 'Tu perfil ha sido actualizado',
      html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #ff6600;">Actualización de perfil</h2>
            <p style="font-size: 16px; line-height: 1.6;">Hola <strong>${name}</strong>, te informamos que tu perfil ha sido actualizado exitosamente.</p>
            <p style="font-size: 16px; line-height: 1.6;">Si no realizaste este cambio, por favor contáctanos inmediatamente.</p>
            <p style="font-size: 14px; color: #888;">El equipo de PowerGym</p>
            </div>`,
    });
  }

  async inactiveUserEmail(name: string, email: string) {
    await transporter.sendMail({
      from: '"PowerGym" <gympower.ok@gmail.com>',
      to: email,
      subject: 'Tu cuenta ha sido desactivada',
      html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #cc0000;">Cuenta desactivada</h2>
            <p style="font-size: 16px; line-height: 1.6;">Hola <strong>${name}</strong>, tu cuenta en PowerGym ha sido desactivada.</p>
            <p style="font-size: 16px; line-height: 1.6;">Si crees que esto es un error o deseas reactivar tu cuenta, comunícate con nosotros.</p>
            <p style="font-size: 14px; color: #888;">El equipo de PowerGym</p>
            </div>`,
    });
  }

  async promoteCoachEmail(name: string, email: string) {
    await transporter.sendMail({
      from: '"PowerGym" gympower.ok@gmail.com>',
      to: email,
      subject: '¡Bienvenido al equipo de entrenadores de PowerGym!',
      html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #ff6600; font-size: 26px;">¡Felicitaciones, ${name}!</h1>
            <p style="font-size: 16px; line-height: 1.6;">Es un placer darte la bienvenida como nuevo <strong>entrenador oficial de PowerGym</strong>.</p>
            <p style="font-size: 16px; line-height: 1.6;">A partir de ahora tendrás acceso a todas las herramientas para gestionar tus clases y acompañar a nuestros miembros en su camino fitness.</p>
            <p style="font-size: 16px; line-height: 1.6;">¡Gracias por ser parte de este equipo!</p>
            <p style="font-size: 14px; color: #888;">El equipo de PowerGym</p>
          </div>`,
    });
  }

  async confirmMembershipEmail(
    name: string,
    email: string,
    planName: string,
    price: number,
    endDate: Date,
  ) {
    await transporter.sendMail({
      from: '"PowerGym" <gympower.ok@gmail.com>',
      to: email,
      subject: '¡Tu membresía está activa!',
      html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #ff6600;">¡Pago confirmado, ${name}!</h2>
            <p style="font-size: 16px; line-height: 1.6;">Tu membresía ha sido activada exitosamente.</p>
            <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; font-size: 16px;"><strong>Plan:</strong> ${planName}</p>
              <p style="margin: 8px 0 0 0; font-size: 16px;"><strong>Precio pagado:</strong> $${price} USD</p>
              <p style="margin: 8px 0 0 0; font-size: 16px;"><strong>Válida hasta:</strong> ${endDate.toLocaleDateString('es-CO')}</p>
            </div>
            <p style="font-size: 16px; line-height: 1.6;">¡Ya puedes comenzar a reservar tus clases!</p>
            <p style="font-size: 14px; color: #888;">El equipo de PowerGym</p>
          </div>`,
    });
  }

  async confirmTokenEmail(
    name: string,
    email: string,
    packageName: string,
    tokenAmount: number,
  ) {
    await transporter.sendMail({
      from: '"PowerGym" <gympower.ok@gmail.com>',
      to: email,
      subject: '¡Tokens añadidos a tu cuenta!',
      html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #ff6600;">¡Compra exitosa, ${name}!</h2>
      <p style="font-size: 16px; line-height: 1.6;">Tu compra de tokens se realizó correctamente.</p>
      <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
      <p style="margin: 0; font-size: 16px;"><strong>Paquete:</strong> ${packageName}</p>
      <p style="margin: 8px 0 0 0; font-size: 16px;"><strong>Tokens añadidos:</strong> ${tokenAmount}</p>
      </div>
      <p style="font-size: 16px; line-height: 1.6;">¡Úsalos para reservar tus clases favoritas!</p>
      <p style="font-size: 14px; color: #888;">El equipo de PowerGym</p>
      </div>`,
    });
  }

  async spendTokenEmail(
    name: string,
    email: string,
    amount: number,
    newBalance: number,
    description: string,
  ) {
    await transporter.sendMail({
      from: '"PowerGym" <gympower.ok@gmail.com>',
      to: email,
      subject: '¡Clase reservada exitosamente!',
      html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #ff6600;">¡Reserva confirmada, ${name}!</h2>
      <p style="font-size: 16px; line-height: 1.6;">Tus tokens han sido descontados exitosamente.</p>
      <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
      <p style="margin: 0; font-size: 16px;"><strong>Detalle:</strong> ${description}</p>
      <p style="margin: 8px 0 0 0; font-size: 16px;"><strong>Tokens descontados:</strong> ${amount}</p>
      <p style="margin: 8px 0 0 0; font-size: 16px;"><strong>Saldo restante:</strong> ${newBalance} tokens</p>
      </div>
      <p style="font-size: 16px; line-height: 1.6;">¡Te esperamos! Recuerda llegar 10 minutos antes.</p>
      <p style="font-size: 14px; color: #888;">El equipo de PowerGym</p>
      </div>`,
    });
  }

  async sendExpiredMembershipEmail(name: string, email: string) {
    await transporter.sendMail({
      from: '"PowerGym" <gympower.ok@gmail.com>',
      to: email,
      subject: 'Tu membresía en PowerGym ha vencido',
      html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #cc0000;">Tu membresía ha vencido</h2>
      <p style="font-size: 16px; line-height: 1.6;">Hola <strong>${name}</strong>, te informamos que tu membresía en PowerGym ha vencido.</p>
      <p style="font-size: 16px; line-height: 1.6;">Para seguir disfrutando de nuestras clases y beneficios, te invitamos a renovar tu plan.</p>
      <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
      <p style="margin: 0; font-size: 16px;">¿Listo para continuar? Ingresa a la app y elige el plan que más te convenga.</p>
      </div>
      <p style="font-size: 14px; color: #888;">El equipo de PowerGym</p>
      </div>`,
    });
  }

  async sendMembershipExpiringSoonEmail(name: string, email: string) {
    await transporter.sendMail({
      from: '"PowerGym" <gympower.ok@gmail.com>',
      to: email,
      subject: '⚠️ Tu membresía en PowerGym está por vencer',
      html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #ff6600;">Tu membresía vence en 3 días</h2>
      <p style="font-size: 16px; line-height: 1.6;">Hola <strong>${name}</strong>, te recordamos que tu membresía en PowerGym vence en <strong>3 días</strong>.</p>
      <p style="font-size: 16px; line-height: 1.6;">Para no perder el acceso a tus clases y beneficios, te recomendamos renovarla antes de que venza.</p>
      <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
      <p style="margin: 0; font-size: 16px;">Ingresa a la app y elige el plan que más te convenga antes de que sea tarde.</p>
      </div>
      <p style="font-size: 14px; color: #888;">El equipo de PowerGym</p>
      </div>`,
    });
  }

  async sendActiveUsersReport(users: Omit<User, 'password'>[], email: string) {
    await transporter.sendMail({
      from: '"PowerGym" <gympower.ok@gmail.com>',
      to: email,
      subject: '📊 Reporte de usuarios activos — PowerGym',
      html: `<div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto;">
            <h1 style="color: #ff6600;">Reporte de usuarios activos</h1>
            <p style="font-size: 16px; color: #555;">Fecha: <strong>${new Date().toLocaleDateString('es-CO')}</strong> — Total: <strong>${users.length} usuarios</strong></p>
                
            <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
              <thead>
                <tr style="background-color: #ff6600; color: white;">
                  <th style="padding: 10px; text-align: left;">Nombre</th>
                  <th style="padding: 10px; text-align: left;">Email</th>
                  <th style="padding: 10px; text-align: left;">Ciudad</th>
                  <th style="padding: 10px; text-align: left;">Tokens</th>
                  <th style="padding: 10px; text-align: left;">Rol</th>
                </tr>
              </thead>
              <tbody>
                ${users
                  .map(
                    (user, index) => `
                  <tr style="background-color: ${index % 2 === 0 ? '#f9f9f9' : '#ffffff'};">
                    <td style="padding: 10px; border-bottom: 1px solid #eee;">${user.name}</td>
                    <td style="padding: 10px; border-bottom: 1px solid #eee;">${user.email}</td>
                    <td style="padding: 10px; border-bottom: 1px solid #eee;">${user.city ?? '—'}</td>
                    <td style="padding: 10px; border-bottom: 1px solid #eee;">${user.tokenBalance}</td>
                    <td style="padding: 10px; border-bottom: 1px solid #eee;">${user.role}</td>
                  </tr>`,
                  )
                  .join('')}
                  </tbody>
                  </table>
                  <p style="font-size: 14px; color: #888; margin-top: 20px;">Este reporte se genera automáticamente cada 5 minutos.</p>
                  </div>`,
    });
  }
}
