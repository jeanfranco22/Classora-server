import { Class } from 'src/class/class.entity';
import { Reservation } from 'src/reservation/reservation.entity';
import { User } from 'src/users/users.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({
  name: 'class_schedule',
})
export class Class_schedule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('date', { nullable: false })
  date: Date;

  @Column('time', { nullable: false })
  time: string;

  @Column('numeric', { default: 0, nullable: false })
  token: number;

  @Column('boolean', { default: true, nullable: false })
  isActive: boolean;

  @Column('int', { default: 0, nullable: false })
  spaces_available: number;

  @ManyToOne(() => Class, (assign) => assign.class_schedule)
  @JoinColumn({ name: 'class_id' })
  class: Class;

  @ManyToOne(() => User, (user) => user.classSchedules)
  @JoinColumn({ name: 'coach_id' })
  coach: User;

  @OneToMany(() => Reservation, (reservation) => reservation.class_schedule)
  reservations: Reservation[];
}
