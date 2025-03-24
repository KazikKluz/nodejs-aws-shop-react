import React from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import axios from 'axios';

type CSVFileImportProps = {
  url: string;
  title: string;
};

export default function CSVFileImport({ url, title }: CSVFileImportProps) {
  const [file, setFile] = React.useState<File>();

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setFile(file);
    }
  };

  const removeFile = () => {
    setFile(undefined);
  };

  const uploadFile = async () => {
    const authToken = localStorage.getItem('authorization_token');
    const headers: any = {};
    if (authToken)
      headers.Authorization = `Basic ${localStorage.getItem(
        'authorization_token'
      )}`;

    try {
      if (!file) {
        console.error('No file selected');
        return;
      }
      console.log('authToekn: ', authToken);
      console.log('headers: ', headers);
      const response = await axios({
        method: 'GET',
        url,
        params: {
          name: encodeURIComponent(file.name),
        },
        headers,
      })
        .then((response) => response)
        .catch((err) => {
          if (err.response?.status === 401) {
            window.dispatchEvent(
              new CustomEvent('global-toast', {
                detail: { message: '401 Unauthorized', severity: 'error' },
              })
            );
          }
          if (err.response?.status === 403) {
            window.dispatchEvent(
              new CustomEvent('global-toast', {
                detail: { message: '403 Forbidden', severity: 'error' },
              })
            );
          }
          return null;
        });

      if (!response) {
        return;
      }

      const result = await fetch(response.data, {
        method: 'PUT',
        body: file,
      });
      console.log('Result: ', result);
      setFile(undefined);
    } catch (error) {
      console.error('There was an error uploading the file', error);
    }

    //   Get the presigned URL
  };
  return (
    <Box>
      <Typography variant='h6' gutterBottom>
        {title}
      </Typography>
      {!file ? (
        <input type='file' onChange={onFileChange} />
      ) : (
        <div>
          <button onClick={removeFile}>Remove file</button>
          <button onClick={uploadFile}>Upload file</button>
        </div>
      )}
    </Box>
  );
}
