import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { catchError, Observable, tap } from "rxjs";
import { DataSource } from "typeorm";

@Injectable()
export class TransactionInterceptor implements NestInterceptor {
    constructor(
        private readonly dataSource: DataSource,
    ) {}
    async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
        const request = context.switchToHttp().getRequest();

        const qr = this.dataSource.createQueryRunner();

        await qr.connect();
        await qr.startTransaction('READ COMMITTED'); // Isolation level 논의 필요

        request.queryRunner = qr;

        return next.handle()
            .pipe(
                catchError(
                    async (error) => {
                        await qr.rollbackTransaction();
                        await qr.release();
                        throw error; // 에러 처리 방법 논의 필요
                    }
                ),
                tap(async ()=> {
                    await qr.commitTransaction();
                    await qr.release();
                }),
            )
    }
}
