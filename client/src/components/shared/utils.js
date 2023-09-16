function handleChangePosition(old, setOld,oldPos, newPos) {
    //FARE CONTROLLO POSIZIONE
    if (newPos < 0 || newPos > old.content.length-1) 
      return
    else {
      //positions go from 0 to length of content array
      let temp = {...old}
      let tempContent = temp.content[oldPos]
      temp.content[oldPos] = temp.content[newPos]
      temp.content[newPos] = tempContent
      temp.content[newPos].position = newPos
      temp.content[oldPos].position = oldPos
      setOld((x) => (Object.assign({}, {page: x.page, content: temp.content, old_content: x.old_content})))
    }
  
  }
  
  function handleDelete(id, old, setOld) {
    setOld((old) => ({...old, content: old.content.filter((x) => x.position != id).map((x,i) =>{
      return x.position >= id ? {...x, position: x.position - 1} : x
    })}))
   
  }
  
  function handleModify(id, text, old, setOld, setModifyingContent) {
    let temp = {...old}
    if(text.length == 0) {
      alert("Text cannot be empty")
    } else {
      temp.content[id].content = text
      setOld((x) => ({page: old.page, content: temp.content, old_content: old.old_content}))
      setModifyingContent()
    }
  
  }
  
  function handleModifyPicture(id, link, old, setOld, setModifyingContent) {
    let temp = old
    temp.content[id].content = link
    setOld((x) => ({page: old.page, content: temp.content, old_content: x.old_content}))
    setModifyingContent()
  }

export {
    handleChangePosition,
    handleDelete,
    handleModify,
    handleModifyPicture
}