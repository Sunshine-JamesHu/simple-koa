import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity()
export class Photo {
  constructor() {
    this.id = 0;
  }
  @PrimaryColumn()
  id: number;

  @Column()
  name!: string;

  @Column({ name: 'description' })
  desc?: string;
}
