import psl from 'psl';
import { NowError } from '../now-error';
import { Output } from '../output';
import Client from '../client';
import createCertForCns from '../certs/create-cert-for-cns';
import setupDomain from '../domains/setup-domain';
import wait from '../output/wait';

export default async function generateCertForDeploy(
  output: Output,
  client: Client,
  contextName: string,
  deployURL: string
) {
  const domain = psl.parse(deployURL).domain as string;
  const cancelSetupWait = wait(`Setting custom suffix domain ${domain}`);
  const result = await setupDomain(output, client, domain, contextName);
  cancelSetupWait();
  if (result instanceof NowError) {
    return result;
  }

  // Generate the certificate with the given parameters
  const cancelCertWait = wait(
    `Generating a wildcard certificate for ${domain}`
  );
  const cert = await createCertForCns(
    client,
    [domain, `*.${domain}`],
    contextName
  );
  cancelCertWait();
  if (cert instanceof NowError) {
    return cert;
  }
}
