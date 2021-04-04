import { NextApiRequest, NextApiResponse } from 'next';
import { Document } from '@prismicio/client/types/documents';
import { getPrismicClient } from '../../services/prismic';

function linkResolver(doc: Document): string {
  if (doc.type === 'posts') {
    return `/post/${doc.uid}`;
  }
  return '/';
}

export default async function (req: NextApiRequest, res: NextApiResponse) {
  const { token: ref, documentId } = req.query;
  console.log({ ref, documentId });

  const prismicClient = getPrismicClient(req);

  const redirectUrl = await prismicClient
    .getPreviewResolver(String(ref), String(documentId))
    .resolve(linkResolver, '/');

  console.log(redirectUrl);

  if (!redirectUrl) {
    return res.status(401).json({ message: 'Invalid token' });
  }

  res.setPreviewData({ ref });
  res.writeHead(302, { Location: `${redirectUrl}` });
  res.end();
}
