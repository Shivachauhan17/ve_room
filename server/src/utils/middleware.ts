import {info,error} from './logger'
import { Request,Response,NextFunction } from 'express'


export const requestLogger = (request:Request, response:Response, next:NextFunction) => {
  info('Method:', request.method)
  info('Path:  ', request.path)
  info('Body:  ', request.body)
  info('---')
  next()
}

export const unknownEndpoint = (request:Request, response:Response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

export const errorHandler = (err:Error,request:Request, response:Response, next:NextFunction) => {
  error(err.message)

  if (err.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (err.name === 'ValidationError') {
    return response.status(400).json({ error: err.message })
  }

  next(error)
}

