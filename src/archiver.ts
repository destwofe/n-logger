import fs from 'fs'
import archiver from 'archiver'
import moment from 'moment'
import os from 'os'
import { CronJob } from 'cron'
import { AsyncQueue } from '@destwofe/n-utils'

import { config } from './config'

/**
 * archive files
 * @param {[String]} inputPaths 
 * @param {String} outputPath 
 */
const archive = async (inputPaths: string[], outputPath: string, isRMInput = false) => {
  console.log('archive', inputPaths)
  try {
    const a = archiver('zip', {
      zlib: { level: 9 } // Sets the compression level. 0 - 9, fast - compress
    });
    // const a = archiver('tar', { gzipOptions: { level: 9 } } )

    const output = fs.createWriteStream(outputPath)
    a.pipe(output);

    // var file1 = __dirname + '/logs/2019-04-24.log';
    // a.append(fs.createReadStream(file1), { name: '2019-04-24.log' });

    inputPaths.forEach(inputPath => {
      a.append(fs.createReadStream(inputPath), { name: inputPath.split('/').pop()! })
    })

    await a.finalize()
    if (isRMInput) {
      inputPaths.forEach(inputPath => {
        fs.unlinkSync(inputPath)
      })
    }

    return undefined
  } catch (error) {
    return error
  }
}

/**
 * archive an old logs
 */
export const ArchiveOldLogs = async () => {
  const files = fs.readdirSync(`${config.logPath}`)
  const days = fs.readdirSync(`${config.logPath}`).filter(a => a.indexOf('Error') == -1 && a.indexOf('.log') !== -1 && a.indexOf(moment().format('YYYY-MM-DD')) === -1).map(a => a.replace('.log', ''))

  const fns = days.map(day => () => archive(files.filter(a => a.indexOf(day) != -1).map(a => `${config.logPath}/${a}`), `${config.archivePath}/${day}.zip`, true))
  await (new AsyncQueue(fns).Execute(os.cpus().length))
}

/**
 * set archive interval active time
 * @param cronTime default is "0 0 * * *" (00:00 of every day)
 */
export const SetArchiveInterval = (cronTime = '0 0 * * *') => {
  const job = new CronJob(cronTime, ArchiveOldLogs)
  job.start()
}
