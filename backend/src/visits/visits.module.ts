import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Person, PersonSchema } from '../people/schemas/person.schema.js';
import { Site, SiteSchema } from '../sites/schemas/site.schema.js';
import { VisitsController } from './visits.controller.js';
import { VisitsService } from './visits.service.js';
import { Visit, VisitSchema } from './schemas/visit.schema.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Visit.name, schema: VisitSchema },
      { name: Person.name, schema: PersonSchema },
      { name: Site.name, schema: SiteSchema },
    ]),
  ],
  controllers: [VisitsController],
  providers: [VisitsService],
  exports: [VisitsService, MongooseModule],
})
export class VisitsModule {}
