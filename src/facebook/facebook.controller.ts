// src/facebook/facebook.controller.ts

import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { FacebookService } from './facebook.service';

@Controller('facebook')
export class FacebookController {
  constructor(private readonly facebookService: FacebookService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('pages')
  async getPages(@Request() req) {
    const userId = req.user.id;
    const pages = await this.facebookService.getUserPages(userId);
    return pages;
  }
}
