The "markdownUp.bare: url" section contains functions for working with URLs in the browser
environment.

Create an object URL for file downloads:

~~~ bare-script
# Create a downloadable text file blob
downloadFilename = 'test.txt'
downloadContent = 'Hello, World!\nThis is a text file.'
downloadURL = urlObjectCreate(downloadContent, 'text/plain')

# Create a link to download the file
elementModelRender({ \
    'html': 'p', \
    'elem': [ \
        { \
            'html': 'a', \
            'attr': {'href': downloadURL, 'download': downloadFilename}, \
            'elem': {'text': 'Download'} \
        } \
    ] \
})
~~~

Object URLs are temporary URLs that reference in-memory data. They're useful for creating
downloadable files on-the-fly without requiring server-side processing. The URLs remain valid until
the page is closed.
