import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const securityDir = path.join(__dirname, 'events', 'security');
const utilsDir = path.join(__dirname, 'utils');

const dbMethods = [
  'saveCreatedChannel', 'getCreatedChannels', 'clearCreatedChannels',
  'saveDeletedChannel', 'getDeletedChannels', 'clearDeletedChannels',
  'saveBannedUser', 'getBannedUsers', 'clearBannedUsers',
  'saveKickedUser', 'getKickedUsers', 'clearKickedUsers',
  'saveUnbannedUser', 'getUnbannedUsers', 'clearUnbannedUsers',
  'saveCreatedRole', 'getCreatedRoles', 'clearCreatedRoles',
  'saveDeletedRole', 'getDeletedRoles', 'clearDeletedRoles',
  'saveOriginalChannel', 'getOriginalChannel', 'getOriginalChannels', 'deleteOriginalChannel', 'clearOriginalChannels',
  'saveOriginalRole', 'getOriginalRole', 'getOriginalRoles', 'deleteOriginalRole', 'clearOriginalRoles',
  'saveOriginalMember', 'getOriginalMember', 'getOriginalMembers', 'deleteOriginalMember', 'clearOriginalMembers',
  'saveOriginalServer', 'getOriginalServer', 'deleteOriginalServer',
  'recordAction', 'countActions', 'clearUserActions'
];

const antiNukeMethods = [
  'recordAction', 'cleanupActionData', 'markOperationComplete'
];

function refactorFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  for (const method of dbMethods) {
    const regex = new RegExp(`(?<!await\\s)(db\\.${method}\\()`, 'g');
    content = content.replace(regex, `await $1`);
  }

  for (const method of antiNukeMethods) {
    const regex = new RegExp(`(?<!await\\s)(AntiNukeManager\\.${method}\\()`, 'g');
    content = content.replace(regex, `await $1`);
  }

  fs.writeFileSync(filePath, content, 'utf8');
}

const files = fs.readdirSync(securityDir).filter(f => f.endsWith('.js'));
for (const file of files) {
  refactorFile(path.join(securityDir, file));
}

refactorFile(path.join(utilsDir, 'AntiNukeManager.js'));

console.log('Refactored all security files successfully.');
