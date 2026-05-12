import { Class_schedule } from 'src/class_schedule/class_schedule.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

export enum Intensity {
  Alta = 'alta',
  Media = 'media',
  Baja = 'baja',
}

@Entity({
  name: 'class',
})
export class Class {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 50, nullable: false })
  name: string;

  @Column('varchar', { length: 10, nullable: false })
  duration: string;

  @Column('varchar', { length: 200 })
  description: string;

  @Column('numeric', { nullable: false })
  capacity: number;

  @Column('boolean', { default: true, nullable: false })
  isActive: boolean;

  @Column('varchar', { length: 10, nullable: false, default: Intensity.Media })
  intensity: Intensity;

  @Column('text', { array: true, nullable: true })
  benefits: string[];

  @Column('varchar', { length: 300, nullable: true })
  requirements: string;

  @OneToMany(() => Class_schedule, (schedule) => schedule.class)
  class_schedule: Class_schedule[];

  @Column({ type: 'text', nullable: true })
  imgUrl: string | null;

  @Column({ type: 'text', nullable: true })
  cloudinaryId: string | null;
}
