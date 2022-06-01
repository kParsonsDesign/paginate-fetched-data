// Page Navigation Buttons Component
const Pagination = ({ items, pageSize, onPageChange }) => {
  const { Button } = ReactBootstrap;
  if (items.length <= 1) return null;
  if (pageSize >= items.length) return null;

  let numPages = Math.ceil(items.length / pageSize);
  let pages = range(1, numPages);
  const list = pages.map((page) => {
    return (
      <>
      <Button variant="outline-secondary" key={page} onClick={onPageChange} className='page-item'>
        {page}
      </Button>&nbsp;
      </>
    );
  });
  return (
    <nav className='container my-3'>
      <ul className='pagination'><span className='lead text-muted'>Page:&nbsp;&nbsp;</span>{list}</ul>
    </nav>
  );
};

const PageSizeSelector = ({ onChange }) => {
  return (
    <form className='my-2 container'>
      <label className='text-muted'>Number of results per page:&nbsp;</label>
      <select defaultValue={10} onChange={onChange} className='form-select-sm bg-light'>
        <option value={5}>5</option>
        <option value={10}>
          10
        </option>
        <option value={20}>20</option>
        <option value={50}>50</option>
      </select>
    </form>
  );
};

const range = (start, end) => {
  return Array(end - start + 1)
    .fill(0)
    .map((item, i) => start + i);
};

function paginate(items, pageNumber, pageSize) {
  const start = (pageNumber - 1) * pageSize;
  let page = items.slice(start, start + pageSize);
  return page;
}

const useDataApi = (initialUrl, initialData) => {
  const { useState, useEffect, useReducer } = React;
  const [url, setUrl] = useState(initialUrl);

  const [state, dispatch] = useReducer(dataFetchReducer, {
    isLoading: false,
    isError: false,
    data: initialData,
  });

  useEffect(() => {
    let didCancel = false;

    console.log('Fetching data...');
    const fetchData = async () => {
      dispatch({ type: 'FETCH_INIT' });
      try {
        const result = await axios(url);
        if (!didCancel) {
          dispatch({ type: 'FETCH_SUCCESS', payload: result.data });
          console.log(result.data);
        }
      } catch (error) {
        if (!didCancel) {
          dispatch({ type: 'FETCH_FAILURE' });
        }
        // setIsError(true);
      }
    };

    fetchData();

    return () => {
      didCancel = true;
    };
  }, [url]);
  return [state, setUrl];
};

const dataFetchReducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_INIT':
      return {
        ...state,
        isLoading: true,
        isError: false,
      };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload,
      };
    case 'FETCH_FAILURE':
      return {
        ...state,
        isLoading: false,
        isError: true,
      };
    default:
      throw new Error();
  }
};

function App() {
  const { Fragment, useState, useEffect, useReducer } = React;
  const [query, setQuery] = useState('');

  // page info
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // array of fetch related states
  const [{ data, isLoading, isError }, doFetch] = useDataApi(
    'https://hn.algolia.com/api/v1/search_by_date?tags=story&hitsPerPage=50',
    { hits: [] }
  );

  const handlePageSizeChane = e => {
    setPageSize(Number(e.target.value));
  }

  const handlePageChange = (e) => {
    setCurrentPage(Number(e.target.textContent));
  };
  let page = data.hits;
  if (page.length >= 1) {
    page = paginate(page, currentPage, pageSize);
    console.log(`currentPage: ${currentPage}`);
  }

  console.log('Rendering App');
  return (
    <Fragment>
      <form
        onSubmit={(event) => {
          doFetch(`http://hn.algolia.com/api/v1/search?query=${query}&tags=story&hitsPerPage=50`);
          event.preventDefault();
        }}
        className="input-group container"
      >
        <input
          type='text'
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="form-control"
        />
        <button type='submit' className='btn btn-outline-secondary'>Search</button>
      </form>
      <PageSizeSelector onChange={handlePageSizeChane} />

      {isError && <div>Something went wrong...</div>}

      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <ul className='list-group container'>
          {page.map((item) => (
            <li key={item.objectID} className='list-group-item'>
              <a href={item.url} className="lead">{item.title}</a><br />
              {/* <span className='text-muted'>Published: {(item.created_at).getMonth()} {(item.created_at).getDate()}, {(item.created_at).getYear()}</span> */}
            </li>
          ))}
        </ul>
      )}
      <Pagination
        items={data.hits}
        pageSize={pageSize}
        onPageChange={handlePageChange}
      ></Pagination>
    </Fragment>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
