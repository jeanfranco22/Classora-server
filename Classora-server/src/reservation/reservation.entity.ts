import { Class_schedule } from 'src/class_schedule/class_schedule.entity';
import { User } from 'src/users/users.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({
  name: 'reservation',
})
export class Reservation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('date', { nullable: false })
  date: Date;

  @Column({
    type: 'enum',
    enum: ['Confirmed', 'Cancelled'],
    default: 'Confirmed', // dad
  })
  status: string;

  @ManyToOne(() => Class_schedule, (schedule) => schedule.reservations)
  @JoinColumn({ name: 'class_schedule_id' })
  class_schedule: Class_schedule;

  @ManyToOne(() => User, (users_ent) => users_ent.reservations)
  @JoinColumn({ name: 'user_id' })
  users: User;
}
