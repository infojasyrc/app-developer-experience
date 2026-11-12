import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { ApiProperty } from '@nestjs/swagger'
import { HydratedDocument } from 'mongoose'

export type RoleDocument = HydratedDocument<Role>

@Schema({ timestamps: true })
export class Role {
  @ApiProperty()
  _id!: string

  @ApiProperty({ description: 'Unique role name' })
  @Prop({ required: true, unique: true })
  name!: string
}

export const RoleSchema = SchemaFactory.createForClass(Role)
