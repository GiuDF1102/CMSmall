const APIURL = 'http://localhost:3000';

function getJson(httpResponsePromise) {
    // server API always return JSON, in case of error the format is the following { error: <message> } 
    return new Promise((resolve, reject) => {
      httpResponsePromise
        .then((response) => {
          if (response.ok) {
           // the server always returns a JSON, even empty {}. Never null or non json, otherwise the method will fail
           response.json()
              .then( json => resolve(json) )
              .catch( err => reject({ error: "Cannot parse server response" }))
  
          } else {
            // analyzing the cause of error
            response.json()
              .then(obj => reject(obj)) // error msg in the response body
              .catch(err => reject({ error: "Cannot parse server response" })) // something else
          }
        })
        .catch(err => 
          reject({ error: "Cannot communicate"  })
        ) // connection error
    });
  }
  
/* GET PAGE BY ID
    Used to retrieve the page and its contents to show them in the PageView component and to load them during the editing of the page.
    This API can be called by any kind of user (guest, admin, manager) so no authentication is needed.
    - request parameters: pageID
    - request body: empty
    - response body: 
        {
            page: {
                authorID: (author username),
                type: (page type), 
                title: (title of the page), 
                creationDate: (creation date),
                pubblicationDate: (pubblication date)
            },
            content: [
                {type: (type of the content), content: (link or text), position: (position of the block on the page)}
                    ...
                {type: (type of the content), content: (link or text), position: (position of the block on the page)}                
            ]
        }
*/
async function getPageByID(pageID) {
    return getJson(fetch(APIURL + '/api/page/' + pageID))
}

/* GET ALL PAGES BY GUEST
    Used to retrieve all pages to show in the PagesTable component. This API can be called by any kinf of user (guest, admin, manager),
    but a distinction of the retrieved list must be done in the server side, based on the user role. The Guest can only see the published 
    pages.
    - request parameters: none
    - response body: list of the pages in this format: 
        { 
            ID: (page ID), //needed for navigation
            type: (page type),
            username: (author username),
            title: (title of the page),
            creationDate: (creation date),
            pubblicationDate: (pubblication date)
        }
 */
async function getAllPagesByGuest() {
    return getJson(fetch(APIURL + '/api/pages/published'))
}

/* GET ALL PAGES BY AUTHENTICATED USER
    Used to retrieve all pages to show in the PagesTable component. This API will be called only by admin and manager, that must be 
    authenticated.
    - request parameters: none
    - request body: empty
    - response body: list of the pages in this format:
        {
            ID: (page ID), //needed for navigation
            type: (page type),
            username: (author username),
            title: (title of the page),
            creationDate: (creation date),
            pubblicationDate: (pubblication date)
        }
*/
async function getAllPagesByAuthenticatedUser() {
    return getJson(fetch(APIURL + '/api/pages', {
            // this parameter specifies that authentication cookie must be forwared
            credentials: 'include'
    }));
}

/* DELETE PAGE
    Used to delete a page. This API will be called only by admin and manager, that must be authenticated.
    - request parameters: pageID
    - request body: empty
    - response body: boolean value that indicates if the page is deleted or not
 */
async function deletePage(pageID) {

    return getJson(fetch(APIURL + '/api/page/' + pageID, {
        method: 'DELETE',
        // this parameter specifies that authentication cookie must be forwared
        credentials: 'include'
    }));
}

/* CREATE PAGE
    Used to create a new page. This API will be called only by admin and manager, that must be authenticated.
    - request parameters: none
    - request body: 
        {
            page: {
                authorID: (author username),
                type: (page type), 
                title: (title of the page), 
                creationDate: (creation date),
                pubblicationDate: (pubblication date)
            },
            content: [
                {type: (type of the content), content: (link or text), position: (position of the block on the page)}
                    ...
                {type: (type of the content), content: (link or text), position: (position of the block on the page)}                
            ]
        }
    - response body: boolean value that indicates if the page is created or not
*/
async function createPage(page) {
    let pubDate = page.page.pubblicationDate;
    if(pubDate === "") {
        page.page.pubblicationDate = null;
        page.page.type = "draft";
    }
    return getJson(fetch(APIURL + '/api/page', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        // this parameter specifies that authentication cookie must be forwared
        credentials: 'include',
        body: JSON.stringify(page),
    }));
}

/* UPDATE PAGE 
    Used to update a page. This API will be called only by admin and manager, that must be authenticated.
    - request parameters: pageID
    - request body:
        {
            page: {
                authorID: (author username),
                type: (page type),
                title: (title of the page),
                creationDate: (creation date),
                pubblicationDate: (pubblication date)
            },
            content: [
                {type: (type of the content), content: (link or text), position: (position of the block on the page)}
                    ...
                {type: (type of the content), content: (link or text), position: (position of the block on the page)}
            ]
        }
    - response body: boolean value that indicates if the page is updated or not

*/
async function updatePage(pageID, page) {
    return getJson(fetch(APIURL + '/api/page/' + pageID, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        // this parameter specifies that authentication cookie must be forwared
        credentials: 'include',
        body: JSON.stringify(page),
    }));
}


/* GET ALL IMAGES 
    Used to get all images. This API will be called only by admin and manager, that must be authenticated. It is needed to get all the images
    when a new image block is added to a page.
    - request parameters: none
    - request body: empty
    - response body: array of images
*/
async function getAllImages() {
    return getJson(fetch(APIURL + '/api/images', {
        method: 'GET',
        // this parameter specifies that authentication cookie must be forwared
        credentials: 'include'
    }));
}

/* UPDATE WEBSITE TITLE
    Used to update the title of the website. This API will be called only by admin, that must be authenticated.
    - request parameters: none
    - request body: {title: (new title)}
    - response body: boolean value that indicates if the title is updated or not
*/
async function updateWebsiteTitle(title) {
    return getJson(fetch(APIURL + '/api/title', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        // this parameter specifies that authentication cookie must be forwared
        credentials: 'include',
        body: JSON.stringify({title:title}),
    }));

}

/* GET WEBSITE TITLE */
async function getWebsiteTitle() {
    return getJson(fetch(APIURL + '/api/title', {
            method: 'GET'
    }));
}

/* SET AUTHOR */
async function setAuthor(author, pageID) {
    return getJson(fetch(APIURL + '/api/author', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        // this parameter specifies that authentication cookie must be forwared
        credentials: 'include',
        body: JSON.stringify({authorID:author, pageID:pageID}),
    }));
}


/* -------------- AUTH -------------------- */
/**
 * This function wants username and password inside a "credentials" object.
 * It executes the log-in.
 */
const logIn = async (credentials) => {
    return getJson(fetch(APIURL + '/api/sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',  // this parameter specifies that authentication cookie must be forwared
      body: JSON.stringify(credentials),
    })
    )
  };
  
  /**
   * This function is used to verify if the user is still logged-in.
   * It returns a JSON object with the user info.
   */
  const getUserInfo = async () => {
    return getJson(fetch(APIURL + '/api/sessions/current', {
      // this parameter specifies that authentication cookie must be forwared
      credentials: 'include'
    })
    )
  };
  
  /**
   * This function destroy the current user's session and execute the log-out.
   */
  const logOut = async() => {
    return getJson(fetch(APIURL + '/api/sessions/current', {
      method: 'DELETE',
      credentials: 'include'  // this parameter specifies that authentication cookie must be forwared
    })
    )
  }

export default { 
    setAuthor,
    getWebsiteTitle,
    updateWebsiteTitle,
    getPageByID,  
    getAllPagesByGuest,
    getAllPagesByAuthenticatedUser,
    deletePage,
    updatePage, 
    getUserInfo, 
    getAllImages,
    createPage,
    logIn, 
    logOut
};