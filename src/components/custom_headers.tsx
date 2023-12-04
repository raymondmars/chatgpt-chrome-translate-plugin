import React from 'react';
import styles from './custom_headers.scss';

const CustomHeaders = (props: { headers: Record<string,string>, onChange: (params: Record<string,string>) => void }) => {

  const [headers, setHeaders] = React.useState<Record<string,string>>(props.headers);
  const [newKey, setNewKey] = React.useState<string>("");
  const [newValue, setNewValue] = React.useState<string>("");
  const [showNewHeader, setShowNewHeader] = React.useState<boolean>(false);

  const handleRemoveHeader = (key: string) => {
    const newHeaders = { ...headers };
    delete newHeaders[key];
    setHeaders(newHeaders);
    props.onChange(newHeaders);
  }

  const handleAddHeader = () => {
    setNewKey("");
    setNewValue("");
    setShowNewHeader(true);
  }

  const handleCreateHeader = () => {
    if(newKey === "" || newValue === "") {
      return 
    }
    const newHeaders = { ...headers };
    newHeaders[newKey.trim()] = newValue.trim();
    setHeaders(newHeaders);
    props.onChange(newHeaders);
    setShowNewHeader(false);
  }

  return (
    <div className={styles.custom_headers}>
      <div className={styles.operaton}><a onClick={handleAddHeader}>{chrome.i18n.getMessage("addRequestHeader")}</a></div>
      <table>
        <thead>
          <tr>
            <th>Key</th>
            <th>Value</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {
            Object.keys(headers).map((key) => {
              return (
                <tr key={key}>
                  <td>{key}</td>
                  <td>{headers[key]}</td>
                  <td><i onClick={() => handleRemoveHeader(key)}>&#x2715;</i></td>
                </tr>
              )
            })
          }
          {
            showNewHeader && <tr>
              <td><input type="text" value={newKey} onChange={e => setNewKey(e.target.value)} /></td>
              <td><input type="text" value={newValue} onChange={e => setNewValue(e.target.value)} /></td>
              <td><i onClick={handleCreateHeader}>&#x2714;</i></td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  )
}

export default CustomHeaders;
