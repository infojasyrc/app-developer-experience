import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'

export type HeadquarterDocument = HydratedDocument<Headquarter>

@Schema()
export class Headquarter {
  @Prop({ required: true, unique: true })
  name!: string
}

export const HeadquarterSchema = SchemaFactory.createForClass(Headquarter)
