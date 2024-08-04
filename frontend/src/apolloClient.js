import { ApolloClient, InMemoryCache, createHttpLink, ApolloLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';

const httpLink = createHttpLink({
  uri: 'http://localhost:4000/graphql',
});

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  if (graphQLErrors) {
    for (let err of graphQLErrors) {
      if (err.extensions.code === 'UNAUTHENTICATED') {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          return fetch('http://localhost:4000/refresh_token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refreshToken }),
          })
            .then(response => response.json())
            .then(({ accessToken }) => {
              localStorage.setItem('token', accessToken);
              // Extract headers from the current operation context
              const { headers } = operation.getContext();
              operation.setContext({
                headers: {
                  ...headers,
                  authorization: `Bearer ${accessToken}`,
                },
              });
              return forward(operation);
            })
            .catch(() => {
              localStorage.removeItem('token');
              localStorage.removeItem('refreshToken');
              window.location.href = '/login';
            });
        }
      }
    }
  }

  if (networkError) {
    console.log(`[Network error]: ${networkError}`);
  }
});

const client = new ApolloClient({
  link: ApolloLink.from([authLink, errorLink, httpLink]),
  cache: new InMemoryCache(),
});

export default client;
