import { Controller } from '@nestjs/common';

@Controller('facebook')
export class FacebookController {
  // constructor(private readonly facebookService: FacebookService) {}
  // @ApiBearerAuth(CONSTANTS.ACCESS_TOKEN)
  // @UseGuards(AuthGuard(CONSTANTS.AUTH.JWT))
  // @Get('pages')
  // async getPages(@Request() req: ExpressRequest) {
  //   const { facebookId } = req.user;
  //   console.log('🚀 ~ FacebookController ~ getPages ~ facebookId:', facebookId);
  //   return await this.facebookService.getUserPages(facebookId);
  // }
}
