const permissions: Record<string, Record<string, string[]>> = {
  '/api/answers/*': {
    GET: ['ROLE_ADMIN', 'ROLE_USER', 'PUBLIC_ACCESS'],
    POST: ['ROLE_ADMIN'],
    PUT: ['ROLE_ADMIN'],
    DELETE: ['ROLE_ADMIN'],
  },
  '/api/answers': {
    GET: ['ROLE_ADMIN', 'ROLE_USER', 'PUBLIC_ACCESS'],
    POST: ['ROLE_ADMIN'],
  },
  '/api/categories/*': {
    GET: ['ROLE_ADMIN', 'ROLE_USER', 'PUBLIC_ACCESS'],
    POST: ['ROLE_ADMIN'],
    DELETE: ['ROLE_ADMIN'],
    PUT: ['ROLE_ADMIN'],
  },
  '/api/categories': {
    GET: ['ROLE_ADMIN', 'ROLE_USER', 'PUBLIC_ACCESS'],
    POST: ['ROLE_ADMIN'],
    DELETE: ['ROLE_ADMIN'],
  },
  '/api/cities/*': {
    GET: ['ROLE_ADMIN', 'ROLE_USER', 'PUBLIC_ACCESS'],
    POST: ['ROLE_ADMIN'],
    DELETE: ['ROLE_ADMIN'],
    PUT: ['ROLE_ADMIN'],
  },
  '/api/cities': {
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
    PUT: ['ROLE_ADMIN'],
  },
  '/api/locations': {
    GET: ['ROLE_ADMIN', 'ROLE_USER', 'PUBLIC_ACCESS'],
    POST: ['ROLE_ADMIN'],
    DELETE: ['ROLE_ADMIN'],
    PUT: ['ROLE_ADMIN'],
  },
  '/api/questions/*': {
    GET: ['ROLE_ADMIN', 'ROLE_USER', 'PUBLIC_ACCESS'],
    POST: ['ROLE_ADMIN'],
    DELETE: ['ROLE_ADMIN'],
    PUT: ['ROLE_ADMIN'],
  },
  '/api/questions': {
    GET: ['ROLE_ADMIN', 'ROLE_USER', 'PUBLIC_ACCESS'],
    POST: ['ROLE_ADMIN'],
  },
  '/api/users/*': {
    GET: ['ROLE_ADMIN'],
    POST: ['ROLE_ADMIN'],
    PUT: ['ROLE_ADMIN'],
    DELETE: ['ROLE_ADMIN'],
  },
  '/api/users': {
    GET: ['ROLE_ADMIN'],
    POST: ['ROLE_ADMIN'],
  },
  '/api/auth*': {
    POST: ['PUBLIC_ACCESS'],
  },
  '/api/votes/*': {
    GET: ['ROLE_ADMIN', 'ROLE_USER', 'PUBLIC_ACCESS'],
    POST: ['ROLE_ADMIN', 'ROLE_USER'],
    DELETE: ['ROLE_ADMIN', 'ROLE_USER'],
  },
  '/api/votes': {
    GET: ['ROLE_ADMIN', 'ROLE_USER', 'PUBLIC_ACCESS'],
    POST: ['ROLE_ADMIN', 'ROLE_USER'],
  },
};

export default permissions;
