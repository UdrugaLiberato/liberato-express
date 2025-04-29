export const permissions: Record<string, Record<string, string[]>> = {
  '/api/answers/*': {
    GET: ['ROLE_ADMIN', 'ROLE_USER', 'PUBLIC_ACCESS'],
    POST: ['ROLE_ADMIN'],
  },
  '/api/categories/*': {
    GET: ['ROLE_ADMIN', 'ROLE_USER', 'PUBLIC_ACCESS'],
    POST: ['ROLE_ADMIN'],
    DELETE: ['ROLE_ADMIN'],
  },
  '/api/cities/*': {
    GET: ['ROLE_ADMIN', 'ROLE_USER', 'PUBLIC_ACCESS'],
    POST: ['ROLE_ADMIN'],
    DELETE: ['ROLE_ADMIN'],
  },
  '/api/cities': {
    GET: ['ROLE_ADMIN', 'ROLE_USER', 'PUBLIC_ACCESS'],
    POST: ['ROLE_ADMIN'],
    DELETE: ['ROLE_ADMIN'],
  },
  '/api/emails/*': {
    GET: ['ROLE_ADMIN', 'ROLE_USER', 'PUBLIC_ACCESS'],
    POST: ['ROLE_ADMIN'],
    DELETE: ['ROLE_ADMIN'],
  },
  '/api/images/*': {
    GET: ['ROLE_ADMIN', 'ROLE_USER', 'PUBLIC_ACCESS'],
    POST: ['ROLE_ADMIN'],
    DELETE: ['ROLE_ADMIN'],
  },
  '/api/image-locations/*': {
    GET: ['ROLE_ADMIN', 'ROLE_USER', 'PUBLIC_ACCESS'],
    POST: ['ROLE_ADMIN'],
    DELETE: ['ROLE_ADMIN'],
  },
  '/api/locations/*': {
    GET: ['ROLE_ADMIN', 'ROLE_USER', 'PUBLIC_ACCESS'],
    POST: ['ROLE_ADMIN'],
    DELETE: ['ROLE_ADMIN'],
  },
  '/api/members/*': {
    GET: ['ROLE_ADMIN', 'ROLE_USER', 'PUBLIC_ACCESS'],
    POST: ['ROLE_ADMIN'],
    DELETE: ['ROLE_ADMIN'],
  },
  '/api/questions/*': {
    GET: ['ROLE_ADMIN', 'ROLE_USER', 'PUBLIC_ACCESS'],
    POST: ['ROLE_ADMIN'],
    DELETE: ['ROLE_ADMIN'],
  },
  '/api/tasks/*': {
    GET: ['ROLE_ADMIN', 'ROLE_USER', 'PUBLIC_ACCESS'],
    POST: ['ROLE_ADMIN'],
    DELETE: ['ROLE_ADMIN'],
  },
  '/api/users/*': {
    GET: ['ROLE_ADMIN', 'ROLE_USER', 'PUBLIC_ACCESS'],
    POST: ['ROLE_ADMIN'],
    DELETE: ['ROLE_ADMIN'],
  },
  '/api/volunteers/*': {
    GET: ['ROLE_ADMIN', 'ROLE_USER', 'PUBLIC_ACCESS'],
    POST: ['ROLE_ADMIN'],
    DELETE: ['ROLE_ADMIN'],
  },
};