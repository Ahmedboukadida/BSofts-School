"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSwagger = setupSwagger;
const swagger_1 = require("@nestjs/swagger");
function setupSwagger(app) {
    const config = new swagger_1.DocumentBuilder()
        .setTitle('BSofts School API')
        .setDescription('API documentation for BSofts School - Multi-tenant School Management System')
        .setVersion('1.0')
        .addTag('Auth')
        .addTag('Users')
        .addTag('Roles')
        .addTag('Permissions')
        .addTag('Establishments')
        .addTag('Tenants')
        .addTag('Classes')
        .addTag('Students')
        .addTag('Teachers')
        .addTag('Parents')
        .addTag('Employees')
        .addTag('Academic')
        .addTag('Lessons')
        .addTag('Exams')
        .addTag('Payments')
        .addTag('Caisses')
        .addTag('Finance')
        .addTag('Attendance')
        .addTag('Scheduling')
        .addTag('Reports')
        .addTag('Settings')
        .addBearerAuth()
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('swagger', app, document);
}
//# sourceMappingURL=swagger.document.js.map