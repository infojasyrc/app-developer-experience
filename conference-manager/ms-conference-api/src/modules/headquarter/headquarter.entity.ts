import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { ApiProperty } from '@nestjs/swagger'
import { HydratedDocument } from 'mongoose'

export type HeadquarterDocument = HydratedDocument<Headquarter>

@Schema({ timestamps: true })
export class Headquarter {
  @ApiProperty()
  _id!: string

  @ApiProperty({ description: 'Headquarter city' })
  @Prop({ required: true })
  city!: string

  @ApiProperty({ description: 'Headquarter country' })
  @Prop({ required: true })
  country!: string

  @Prop({ required: true })
  createdBy!: string

  @Prop({ required: false })
  updatedBy?: string

  // Managed by Mongoose timestamps: true — do not add @Prop
  readonly createdAt!: Date
  readonly updatedAt!: Date
}

export const HeadquarterSchema = SchemaFactory.createForClass(Headquarter)

// Compound unique index — a city+country pair must be unique across headquarters
HeadquarterSchema.index({ city: 1, country: 1 }, { unique: true })
