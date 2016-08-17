process.env.NODE_ENV = 'test'

var expect = require('expect.js');
var database = require('../database')

describe('database', ()=>{

  beforeEach(()=>{
    return database.truncateAllTable()
  })


  describe('getAllBooks', ()=>{
    it('should return all the books', ()=>{
      return database.getAllBooks().then(books =>{
        expect(books).to.be.a(Array)
        expect(books.length).to.eql(0)
      })
    });
  });

  describe('createBook', ()=>{
    it('should insert one book into the books table', ()=>{
      const attributes = {
        title: 'The way the wind blows',
        description: 'wind is awesome',
        published_at: '2001/1/1',
        fiction: true,
        image_url: 'http://example.org/fart.jpeg',
        genres: [],
        authors: [
          {
            name: 'Susan Surandin',
            description: '',
          }
        ],
      }
      return database.createBook(attributes).then(bookId =>{
        return database.getBookById(bookId).then(book =>{
          expect(book).to.be.a(Object)
          expect(book.id).to.be.a('number')
          expect(book.title).to.eql('The way the wind blows')
          expect(book.description).to.eql('wind is awesome')
          expect(book.published_at+'').to.eql('Wed Aug 17 2016 00:00:00 GMT-0700 (PDT)')
          expect(book.fiction).to.eql(true)
          expect(book.image_url).to.eql('http://example.org/fart.jpeg')
        })
      })
    });
  });
});