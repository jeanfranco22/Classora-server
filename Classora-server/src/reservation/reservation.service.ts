import {
  forwardRef,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ReservationRepository } from './reservation.repository';
import { usersRepository } from 'src/users/users.repository';
import { ClassScheduleRepository } from 'src/class_schedule/class_schedule.repository';
import { PaymentsService } from 'src/payments/payments.service';
import { User } from 'src/users/users.entity';

@Injectable()
export class ReservationService {
  constructor(
    private readonly reservationRepository: ReservationRepository,
    @Inject(forwardRef(() => usersRepository))
    private usersRepository: usersRepository,
    private classScheduleRepository: ClassScheduleRepository,
    private paymentsService: PaymentsService,
    private configService: ConfigService,
  ) {}

  async reserve(id_user: string, id_class_schedule: string) {
    // Buscamos si el usuario existe y esta activo
    const find_user = await this.usersRepository.getUserById(id_user);

    // Buscamos si la cita de la clase existe
    const find_class_schedule =
      await this.classScheduleRepository.find_class_schedule_by_id(
        id_class_schedule,
      );

    // Nos fijamos que no exista la reservacion ya hecha por usuario
    await this.reservationRepository.find_exist_reservation(
      id_user,
      id_class_schedule,
    );

    const confirmedReservations =
      await this.reservationRepository.find_reservation_by_class_schedule(
        id_class_schedule,
      );
    const spacesAvailable =
      Number(find_class_schedule.class.capacity) - confirmedReservations.length;

    if (spacesAvailable <= 0) {
      throw new UnauthorizedException(
        'No hay mas cupos disponibles para la clase',
      );
    }

    const betaAllowsReservationsWithoutTokens =
      this.configService.get<string>(
        'BETA_ALLOW_RESERVATIONS_WITHOUT_TOKENS',
      ) === 'true';

    // Extraemos el dato de el costo de tokens de la clase
    const class_cost_tokens = find_class_schedule.token;
    const user_tokens = find_user.tokenBalance;

    // Creamos una descripción para el metodo spendTokens
    const reservation_description = `Reserva clase ${find_class_schedule.class.name} - ${find_class_schedule.date.toString()} ${find_class_schedule.time}`;

    // Chequeamos que el usuario tengo la cantidad de tokens suficientes para gastar en la clase
    if (!betaAllowsReservationsWithoutTokens && user_tokens < class_cost_tokens) {
      throw new UnauthorizedException(
        'No tiene tokens suficientes para acceder a esta clase',
      );
    }

    if (!betaAllowsReservationsWithoutTokens) {
      // Si tiene los tokens suficientes le restamos tokens del usuario con spendTokens de paymentsService
      await this.paymentsService.spendTokens(
        id_user,
        class_cost_tokens,
        reservation_description,
      );
    }

    const new_reservation = await this.reservationRepository.save_reservation({
      date: new Date(),
      class_schedule: find_class_schedule,
      status: 'Confirmed', // Ya puse en el default, pero no está de más
      users: { id: find_user.id } as User,
    });

    return {
      success: true,
      message: 'Se realizó la reservación de la clase correctamente',
      reservation_id: new_reservation.id,
    };
  }

  cancel_reserve_class(id: string, userId: string) {
    return this.reservationRepository.cancel_reserve(id, userId);
  }

  get_reservations() {
    return this.reservationRepository.get_reserves();
  }

  get_reserves_by_id(id: string) {
    return this.reservationRepository.get_by_id(id);
  }

  get_reservations_by_coach(coachId: string) {
    return this.reservationRepository.get_reservation_by_coach(coachId);
  }
}
