import dns from 'dns';
import {send, sendError, NowRequest, NowResponse} from '../util/http';

function resolvePromise(hostname: string): Promise<string[]> {
  return new Promise((resolve, reject) => {
    dns.resolve4(hostname, function(err, addresses) {
      if (err) return reject(err);
      resolve(addresses);
    });
  });
}

export default async function handler(
  req: NowRequest,
  res: NowResponse,
): Promise<void> {
  const {query} = req.query;

  if (!query) {
    return sendError(res, new Error('No query given'));
  }

  try {
    const response = await resolvePromise(query);
    const availability = response && response.length > 0 ? false : true;
    send(res, {availability});
  } catch (err) {
    if (err.code === 'ENODATA' || err.code === 'ENOTFOUND') {
      return send(res, {availability: true});
    }
    sendError(res, err);
  }
}
